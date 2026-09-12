import uuid
from datetime import datetime
from extensions import db


class Scan(db.Model):
    __tablename__ = "scans"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True, index=True)
    document_type_id = db.Column(
        db.Integer, db.ForeignKey("document_types.id"), nullable=True, index=True
    )

    original_filename = db.Column(db.String(255), nullable=False)
    saved_filename = db.Column(db.String(255), nullable=False, unique=True)
    original_image_path = db.Column(db.String(512), nullable=True)
    processed_image_path = db.Column(db.String(512), nullable=True)

    raw_text = db.Column(db.Text, nullable=True)
    detected_type_confidence = db.Column(db.Float, nullable=True)
    ocr_confidence = db.Column(db.Float, nullable=True)

    status = db.Column(
        db.String(20), nullable=False, default="pending", index=True
    )
    processing_time_ms = db.Column(db.Integer, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    validated_at = db.Column(db.DateTime, nullable=True)
    validated_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)

    user = db.relationship("User", back_populates="scans", foreign_keys=[user_id])
    document_type = db.relationship("DocumentType", back_populates="scans")
    extracted_fields = db.relationship(
        "ExtractedField", back_populates="scan", cascade="all, delete-orphan"
    )
    corrections = db.relationship(
        "Correction", back_populates="scan", cascade="all, delete-orphan"
    )

    def to_dict(self, include_fields=True, include_text=False):
        data = {
            "id": self.id,
            "original_filename": self.original_filename,
            "saved_filename": self.saved_filename,
            "document_type": self.document_type.to_dict() if self.document_type else None,
            "status": self.status,
            "ocr_confidence": self.ocr_confidence,
            "detected_type_confidence": self.detected_type_confidence,
            "processing_time_ms": self.processing_time_ms,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "validated_at": self.validated_at.isoformat() if self.validated_at else None,
        }
        if include_text:
            data["raw_text"] = self.raw_text
        if include_fields:
            data["extracted"] = {
                f.field_key: f.validated_value or f.raw_value
                for f in self.extracted_fields
            }
        return data