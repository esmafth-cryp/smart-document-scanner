from flask import Blueprint, jsonify, request
from sqlalchemy import or_, desc

from extensions import db
from models import Scan, DocumentType, ExtractedField


scan_bp = Blueprint("scans", __name__)


@scan_bp.get("/scans")
def list_scans():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    status = request.args.get("status")
    document_type_code = request.args.get("document_type")
    search = request.args.get("search")

    query = Scan.query

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