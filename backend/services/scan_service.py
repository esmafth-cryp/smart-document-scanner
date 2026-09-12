from extensions import db
from models import Scan, ExtractedField, DocumentType


DOC_TYPE_MAPPING = {
    "decision": "decision_stage",
    "stage": "decision_stage",
    "facture": "invoice",
    "invoice": "invoice",
    "bon de livraison": "delivery_note",
    "livraison": "delivery_note",
    "connaissement": "bill_of_lading",
}


def detect_document_type_code(document_data: dict) -> str:
    doc_type = (document_data.get("document_type") or "").lower()
    for keyword, code in DOC_TYPE_MAPPING.items():
        if keyword in doc_type:
            return code
    return "unknown"


def get_or_create_document_type(code: str, label: str = None) -> DocumentType:
    dt = DocumentType.query.filter_by(code=code).first()
    if dt:
        return dt
    dt = DocumentType(
        code=code,
        label=label or code.replace("_", " ").title(),
        active=True,
    )
    db.session.add(dt)
    db.session.flush()
    return dt


def compute_ocr_confidence(lines: list) -> float:
    if not lines:
        return 0.0
    confidences = [
        l.get("confidence", 0)
        for l in lines
        if isinstance(l.get("confidence"), (int, float))
    ]
    if not confidences:
        return 0.0
    return round(sum(confidences) / len(confidences), 4)


def save_scan(
    original_filename: str,
    saved_filename: str,
    document_data: dict,
    raw_text: str,
    lines: list,
    processing_time_ms: int = None,
    user_id: str = None,
) -> Scan:
    type_code = detect_document_type_code(document_data)
    document_type = get_or_create_document_type(type_code)

    scan = Scan(
        user_id=user_id,
        document_type_id=document_type.id,
        original_filename=original_filename,
        saved_filename=saved_filename,
        raw_text=raw_text,
        detected_type_confidence=1.0 if type_code != "unknown" else 0.0,
        ocr_confidence=compute_ocr_confidence(lines),
        status="pending",
        processing_time_ms=processing_time_ms,
    )
    db.session.add(scan)
    db.session.flush()

    for key, value in document_data.items():
        if value is None:
            continue
        field = ExtractedField(
            scan_id=scan.id,
            field_key=key,
            raw_value=str(value),
            confidence=None,
            is_corrected=False,
        )
        db.session.add(field)

    db.session.commit()
    return scan