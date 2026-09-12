from datetime import datetime
from extensions import db


class DocumentType(db.Model):
    __tablename__ = "document_types"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    label = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    scans = db.relationship("Scan", back_populates="document_type")

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "label": self.label,
            "description": self.description,
            "active": self.active,
        }