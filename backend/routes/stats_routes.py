from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from sqlalchemy import func

from extensions import db
from models import Scan, DocumentType


stats_bp = Blueprint("stats", __name__)


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


def apply_user_filter(query, user_id, role):
    """
    Applique le filtre par utilisateur :
    - Admin : voit tout
    - Autres : voient seulement leurs propres scans
    """
    if role != "admin" and user_id:
        query = query.filter(Scan.user_id == user_id)
    elif role != "admin" and not user_id:
        # Pas connecté → aucun résultat
        query = query.filter(False)
    return query


@stats_bp.get("/stats/overview")
def overview():
    user_id, role = get_current_user_info()

    # === TOTAL SCANS ===
    q_total = apply_user_filter(Scan.query, user_id, role)
    total_scans = q_total.count()

    # === SCANS AUJOURD'HUI ===
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    q_today = apply_user_filter(
        Scan.query.filter(Scan.created_at >= today_start),
        user_id,
        role,
    )
    scans_today = q_today.count()

    # === VALIDÉS ===
    q_validated = apply_user_filter(
        Scan.query.filter(Scan.status.in_(["validated", "corrected"])),
        user_id,
        role,
    )
    validated = q_validated.count()
    success_rate = round(validated / total_scans, 4) if total_scans > 0 else 0.0

    # === CONFIANCE OCR MOYENNE ===
    q_conf = apply_user_filter(
        db.session.query(func.avg(Scan.ocr_confidence)),
        user_id,
        role,
    )
    avg_conf = q_conf.scalar()
    avg_conf = round(float(avg_conf), 4) if avg_conf else 0.0

    # === TEMPS MOYEN ===
    q_time = apply_user_filter(
        db.session.query(func.avg(Scan.processing_time_ms)),
        user_id,
        role,
    )
    avg_time = q_time.scalar()
    avg_time = int(avg_time) if avg_time else None

    return jsonify(
        {
            "success": True,
            "overview": {
                "total_scans": total_scans,
                "scans_today": scans_today,
                "success_rate": success_rate,
                "avg_ocr_confidence": avg_conf,
                "avg_processing_ms": avg_time,
            },
        }
    )


@stats_bp.get("/stats/timeline")
def timeline():
    days = request.args.get("days", 30, type=int)
    days = min(max(days, 1), 90)

    user_id, role = get_current_user_info()

    start = datetime.utcnow() - timedelta(days=days - 1)
    start = start.replace(hour=0, minute=0, second=0, microsecond=0)

    q = (
        db.session.query(
            func.date(Scan.created_at).label("day"),
            func.count(Scan.id).label("count"),
        )
        .filter(Scan.created_at >= start)
    )

    q = apply_user_filter(q, user_id, role)

    rows = (
        q.group_by(func.date(Scan.created_at))
        .order_by(func.date(Scan.created_at))
        .all()
    )

    existing = {str(r.day): r.count for r in rows}
    series = []
    for i in range(days):
        day = (start + timedelta(days=i)).date()
        key = str(day)
        series.append({"date": key, "count": existing.get(key, 0)})

    return jsonify({"success": True, "series": series})


@stats_bp.get("/stats/document-types")
def document_types():
    user_id, role = get_current_user_info()

    q = (
        db.session.query(
            DocumentType.code,
            DocumentType.label,
            func.count(Scan.id).label("count"),
        )
        .join(Scan, Scan.document_type_id == DocumentType.id, isouter=True)
    )

    q = apply_user_filter(q, user_id, role)

    rows = (
        q.group_by(DocumentType.code, DocumentType.label)
        .all()
    )

    types = [
        {"code": r.code, "label": r.label, "count": r.count}
        for r in rows
    ]

    return jsonify({"success": True, "types": types})