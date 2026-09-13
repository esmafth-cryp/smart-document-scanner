from datetime import datetime
from pathlib import Path
from flask import Blueprint, jsonify, request
from sqlalchemy import or_, desc

from extensions import db
from models import Scan, DocumentType, ExtractedField


scan_bp = Blueprint("scans", __name__)


def get_current_user_info():
    """
    Récupère l'utilisateur courant depuis le JWT.
    Retourne (user_id, role) ou (None, None) si pas authentifié.
    """
    from flask_jwt_extended import get_jwt_identity, get_jwt, verify_jwt_in_request

    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        claims = get_jwt() or {}
        role = claims.get("role", "viewer")
        return user_id, role
    except Exception:
        return None, None


@scan_bp.get("/scans")
def list_scans():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    status = request.args.get("status")
    document_type_code = request.args.get("document_type")
    search = request.args.get("search")

    user_id, role = get_current_user_info()

    query = Scan.query

    # === ISOLATION PAR UTILISATEUR ===
    # Admin voit tout, les autres voient seulement leurs propres scans
    if role != "admin" and user_id:
        query = query.filter(Scan.user_id == user_id)
    elif role != "admin" and not user_id:
        # Pas connecté → aucun scan
        return jsonify(
            {
                "success": True,
                "items": [],
                "total": 0,
                "page": 1,
                "pages": 1,
                "per_page": per_page,
            }
        )

    if status:
        query = query.filter(Scan.status == status)

    if document_type_code:
        query = query.join(DocumentType).filter(DocumentType.code == document_type_code)

    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                Scan.original_filename.ilike(like),
                Scan.raw_text.ilike(like),
            )
        )

    query = query.order_by(desc(Scan.created_at))

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        {
            "success": True,
            "items": [s.to_dict(include_fields=False) for s in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "pages": pagination.pages,
            "per_page": pagination.per_page,
        }
    )


@scan_bp.get("/scans/<scan_id>")
def get_scan(scan_id):
    scan = Scan.query.get(scan_id)
    if not scan:
        return jsonify({"success": False, "error": "Scan introuvable."}), 404

    # === ISOLATION ===
    user_id, role = get_current_user_info()
    if role != "admin" and user_id and str(scan.user_id) != str(user_id):
        return (
            jsonify({"success": False, "error": "Accès refusé."}),
            403,
        )

    data = scan.to_dict(include_fields=True, include_text=True)
    data["extracted"] = {
        f.field_key: {
            "raw": f.raw_value,
            "validated": f.validated_value,
            "is_corrected": f.is_corrected,
        }
        for f in scan.extracted_fields
    }
    return jsonify({"success": True, "scan": data})


@scan_bp.patch("/scans/<scan_id>/validate")
def validate_scan(scan_id):
    from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
    from models import Correction, AuditLog

    scan = Scan.query.get(scan_id)
    if not scan:
        return jsonify({"success": False, "error": "Scan introuvable."}), 404

    user_id, role = get_current_user_info()

    # === ISOLATION ===
    if role != "admin" and user_id and str(scan.user_id) != str(user_id):
        return jsonify({"success": False, "error": "Accès refusé."}), 403

    data = request.get_json(silent=True) or {}
    corrections = data.get("corrections", {})
    if not user_id:
        user_id = data.get("user_id")

    for field_key, new_value in corrections.items():
        field = ExtractedField.query.filter_by(
            scan_id=scan.id, field_key=field_key
        ).first()

        if not field:
            field = ExtractedField(
                scan_id=scan.id,
                field_key=field_key,
                raw_value=None,
                validated_value=new_value,
                is_corrected=True,
            )
            db.session.add(field)
            continue

        old_value = field.validated_value or field.raw_value

        if old_value != new_value:
            field.validated_value = new_value
            field.is_corrected = True

            correction = Correction(
                scan_id=scan.id,
                user_id=user_id,
                field_key=field_key,
                old_value=old_value,
                new_value=new_value,
            )
            db.session.add(correction)

    scan.status = "validated"
    scan.validated_at = datetime.utcnow()
    scan.validated_by = user_id

    audit = AuditLog(
        user_id=user_id,
        action="scan.validate",
        entity_type="scan",
        entity_id=scan.id,
        ip_address=request.remote_addr,
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({"success": True, "scan": scan.to_dict()})


@scan_bp.delete("/scans/<scan_id>")
def delete_scan(scan_id):
    """
    Supprime un scan.
    - Admin : peut supprimer n'importe quel scan
    - Agent : peut supprimer UNIQUEMENT ses propres scans
    - Viewer : ne peut pas supprimer
    """
    from flask_jwt_extended import verify_jwt_in_request
    from models import AuditLog

    try:
        verify_jwt_in_request()
    except Exception:
        return jsonify({"success": False, "error": "Authentification requise."}), 401

    user_id, role = get_current_user_info()

    scan = Scan.query.get(scan_id)
    if not scan:
        return jsonify({"success": False, "error": "Scan introuvable."}), 404

    # === VÉRIFICATION DES PERMISSIONS ===
    is_admin = role == "admin"
    is_owner = str(scan.user_id) == str(user_id)

    if role == "viewer":
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Accès refusé. Les lecteurs ne peuvent pas supprimer.",
                }
            ),
            403,
        )

    if not is_admin and not is_owner:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Vous ne pouvez supprimer que vos propres scans.",
                }
            ),
            403,
        )

    scan_filename = scan.original_filename
    scan_saved_filename = scan.saved_filename

    # Supprimer le fichier physique
    if scan_saved_filename:
        try:
            upload_folder = Path(__file__).resolve().parent.parent / "uploads"
            file_path = upload_folder / scan_saved_filename
            if file_path.exists():
                file_path.unlink()
        except Exception as e:
            print(f"[WARN] Impossible de supprimer {scan_saved_filename}: {e}")

    # Audit log
    audit = AuditLog(
        user_id=user_id,
        action="scan.delete",
        entity_type="scan",
        entity_id=scan.id,
        ip_address=request.remote_addr,
    )
    db.session.add(audit)

    db.session.delete(scan)
    db.session.commit()

    return jsonify(
        {
            "success": True,
            "message": "Scan supprimé avec succès.",
            "deleted_id": scan_id,
            "filename": scan_filename,
        }
    )


@scan_bp.get("/scans/<scan_id>/export")
def export_scan(scan_id):
    import csv
    import io

    fmt = request.args.get("format", "json").lower()
    scan = Scan.query.get(scan_id)
    if not scan:
        return jsonify({"success": False, "error": "Scan introuvable."}), 404

    # === ISOLATION ===
    user_id, role = get_current_user_info()
    if role != "admin" and user_id and str(scan.user_id) != str(user_id):
        return jsonify({"success": False, "error": "Accès refusé."}), 403

    fields = {
        f.field_key: f.validated_value or f.raw_value
        for f in scan.extracted_fields
    }

    if fmt == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["champ", "valeur"])
        for k, v in fields.items():
            writer.writerow([k, v or ""])
        return (
            output.getvalue().encode("utf-8-sig"),
            200,
            {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": f'attachment; filename="scan_{scan_id[:8]}.csv"',
            },
        )

    if fmt == "xlsx":
        try:
            from openpyxl import Workbook

            wb = Workbook()
            ws = wb.active
            ws.title = "Scan"
            ws.append(["Champ", "Valeur"])
            for k, v in fields.items():
                ws.append([k, v or ""])
            xlsx_bytes = io.BytesIO()
            wb.save(xlsx_bytes)
            xlsx_bytes.seek(0)
            return (
                xlsx_bytes.getvalue(),
                200,
                {
                    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "Content-Disposition": f'attachment; filename="scan_{scan_id[:8]}.xlsx"',
                },
            )
        except ImportError:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Export Excel indisponible. Installez openpyxl.",
                    }
                ),
                500,
            )

    return jsonify(
        {
            "success": True,
            "scan": {
                "id": scan.id,
                "original_filename": scan.original_filename,
                "document_type": scan.document_type.to_dict() if scan.document_type else None,
                "status": scan.status,
                "created_at": scan.created_at.isoformat() if scan.created_at else None,
                "validated_at": scan.validated_at.isoformat() if scan.validated_at else None,
                "extracted": fields,
                "raw_text": scan.raw_text,
            },
        }
    )


@scan_bp.get("/notifications")
def list_notifications():
    from models import AuditLog

    logs = (
        AuditLog.query.order_by(desc(AuditLog.created_at))
        .limit(10)
        .all()
    )

    items = []
    for log in logs:
        label = {
            "scan.create": "Nouveau scan",
            "scan.validate": "Scan validé",
            "scan.delete": "Scan supprimé",
            "user.create": "Nouvel utilisateur créé",
            "user.update": "Utilisateur modifié",
            "user.delete": "Utilisateur supprimé",
        }.get(log.action, log.action)

        items.append(
            {
                "id": log.id,
                "action": log.action,
                "label": label,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
        )

    return jsonify({"success": True, "items": items})