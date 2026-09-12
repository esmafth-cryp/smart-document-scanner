from datetime import datetime
from extensions import db


class ExtractedField(db.Model):
    __tablename__ = "extracted_fields"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    scan_id = db.Column(
        db.String(36), db.ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    field_key = db.Column(db.String(80), nullable=False, index=True)
    raw_value = db.Column(db.Text, nullable=True)
    validated_value = db.Column(db.Text, nullable=True)
    confidence = db.Column(db.Float, nullable=True)
    is_corrected = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    scan = db.relationship("Scan", back_populates="extracted_fields")

    def to_dict(self):
        return {
            "field_key": self.field_key,
            "raw_value": self.raw_value,
            "validated_value": self.validated_value,
            "confidence": self.confidence,
            "is_corrected": self.is_corrected,
        }