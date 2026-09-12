from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from sqlalchemy import func

from extensions import db
from models import Scan, DocumentType


stats_bp = Blueprint("stats", __name__)


@stats_bp.get("/stats/overview")
def overview():
    total_scans = Scan.query.count()

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    scans_today = Scan.query.filter(Scan.created_at >= today_start).count()

    validated = Scan.query.filter(Scan.status.in_(["validated", "corrected"])).count()
    success_rate = round(validated / total_scans, 4) if total_scans > 0 else 0.0

    avg_conf = db.session.query(func.avg(Scan.ocr_confidence)).scalar()
    avg_conf = round(float(avg_conf), 4) if avg_conf else 0.0

    avg_time = db.session.query(func.avg(Scan.processing_time_ms)).scalar()
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

    start = datetime.utcnow() - timedelta(days=days - 1)
    start = start.replace(hour=0, minute=0, second=0, microsecond=0)

    rows = (
        db.session.query(
            func.date(Scan.created_at).label("day"),
            func.count(Scan.id).label("count"),
        )
        .filter(Scan.created_at >= start)
        .group_by(func.date(Scan.created_at))
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
    rows = (
        db.session.query(
            DocumentType.code,
            DocumentType.label,
            func.count(Scan.id).label("count"),
        )
        .join(Scan, Scan.document_type_id == DocumentType.id, isouter=True)
        .group_by(DocumentType.code, DocumentType.label)
        .all()
    )

    types = [
        {"code": r.code, "label": r.label, "count": r.count}
        for r in rows
    ]

    return jsonify({"success": True, "types": types})