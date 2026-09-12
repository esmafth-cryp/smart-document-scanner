from datetime import datetime
from extensions import db


class Correction(db.Model):
    __tablename__ = "corrections"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    scan_id = db.Column(
        db.String(36), db.ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    field_key = db.Column(db.String(80), nullable=False)
    old_value = db.Column(db.Text, nullable=True)
    new_value = db.Column(db.Text, nullable=True)
    corrected_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    scan = db.relationship("Scan", back_populates="corrections")
    user = db.relationship("User", back_populates="corrections")

    def to_dict(self):
        return {
            "id": self.id,
            "scan_id": self.scan_id,
            "field_key": self.field_key,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "corrected_at": self.corrected_at.isoformat() if self.corrected_at else None,
        }