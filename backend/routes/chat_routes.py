import re
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from sqlalchemy import func

from extensions import db
from models import Scan, User, DocumentType, ExtractedField


chat_bp = Blueprint("chat", __name__)


def _respond(text, intent, data=None):
    return {
        "success": True,
        "reply": text,
        "intent": intent,
        "data": data or {},
    }


def _normalize(text):
    return (text or "").lower().strip()


def _match_any(text, keywords):
    return any(k in text for k in keywords)


@chat_bp.post("/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    message = _normalize(payload.get("message", ""))
    lang = payload.get("lang", "fr")

    if not message:
        return jsonify(
            _respond(
                "Posez-moi une question sur vos documents."
                if lang == "fr"
                else "Ask me a question about your documents.",
                "empty",
            )
        )

    # --- Total scans ---
    if _match_any(message, ["combien de scan", "nombre de scan", "total scan", "how many scan", "total scan"]):
        total = Scan.query.count()
        msg = (
            f"Vous avez actuellement **{total} scan(s)** enregistré(s)."
            if lang == "fr"
            else f"You currently have **{total} scan(s)** recorded."
        )
        return jsonify(_respond(msg, "total_scans", {"total": total}))

    # --- Scans aujourd'hui ---
    if _match_any(message, ["aujourd", "today"]):
        today = datetime.utcnow().date()
        count = Scan.query.filter(func.date(Scan.created_at) == today).count()
        msg = (
            f"**{count} scan(s)** ont été effectués aujourd'hui."
            if lang == "fr"
            else f"**{count} scan(s)** were done today."
        )
        return jsonify(_respond(msg, "scans_today", {"count": count}))

    # --- Taux de réussite / validés ---
    if _match_any(message, ["réussite", "validé", "valid", "success", "taux"]):
        total = Scan.query.count()
        validated = Scan.query.filter_by(status="validated").count()
        rate = round((validated / total * 100) if total else 0, 1)
        msg = (
            f"Taux de réussite : **{rate}%** ({validated} validés sur {total})."
            if lang == "fr"
            else f"Success rate: **{rate}%** ({validated} validated out of {total})."
        )
        return jsonify(_respond(msg, "success_rate", {"rate": rate, "validated": validated, "total": total}))

    # --- Confiance OCR ---
    if _match_any(message, ["confiance", "ocr", "confidence"]):
        avg = db.session.query(func.avg(Scan.ocr_confidence)).scalar() or 0
        pct = round(avg * 100, 1)
        msg = (
            f"Confiance OCR moyenne : **{pct}%**."
            if lang == "fr"
            else f"Average OCR confidence: **{pct}%**."
        )
        return jsonify(_respond(msg, "ocr_confidence", {"confidence": pct}))

    # --- Derniers scans ---
    if _match_any(message, ["dernier", "récents", "recent", "last"]):
        scans = Scan.query.order_by(Scan.created_at.desc()).limit(5).all()
        if not scans:
            msg = "Aucun scan pour l'instant." if lang == "fr" else "No scans yet."
            return jsonify(_respond(msg, "recent_scans", {"items": []}))
        lines = "\n".join(
            f"- {s.original_filename} ({s.status})" for s in scans
        )
        msg = (
            f"Voici les 5 derniers scans :\n{lines}"
            if lang == "fr"
            else f"Here are the last 5 scans:\n{lines}"
        )
        return jsonify(
            _respond(
                msg,
                "recent_scans",
                {"items": [{"id": s.id, "filename": s.original_filename, "status": s.status} for s in scans]},
            )
        )

    # --- Types de documents ---
    if _match_any(message, ["type", "types", "kind"]):
        results = (
            db.session.query(DocumentType.label, func.count(Scan.id))
            .outerjoin(Scan, Scan.document_type_id == DocumentType.id)
            .group_by(DocumentType.label)
            .all()
        )
        if not results:
            msg = "Aucun type de document enregistré." if lang == "fr" else "No document types recorded."
            return jsonify(_respond(msg, "document_types", {"items": []}))
        lines = "\n".join(f"- {label} : {count}" for label, count in results)
        msg = (
            f"Répartition par type :\n{lines}"
            if lang == "fr"
            else f"Distribution by type:\n{lines}"
        )
        return jsonify(_respond(msg, "document_types", {"items": [{"label": l, "count": c} for l, c in results]}))

    # --- Utilisateurs ---
    if _match_any(message, ["utilisateur", "user", "combien de personne"]):
        total = User.query.count()
        admins = User.query.filter_by(role="admin").count()
        agents = User.query.filter_by(role="agent").count()
        viewers = User.query.filter_by(role="viewer").count()
        msg = (
            f"**{total} utilisateur(s)** enregistré(s) : {admins} admin(s), {agents} agent(s), {viewers} lecteur(s)."
            if lang == "fr"
            else f"**{total} user(s)** registered: {admins} admin(s), {agents} agent(s), {viewers} viewer(s)."
        )
        return jsonify(_respond(msg, "users", {"total": total, "admins": admins, "agents": agents, "viewers": viewers}))

    # --- Aide / fallback ---
    help_fr = (
        "Je peux répondre à ces questions :\n"
        "- Combien de scans ?\n"
        "- Combien aujourd'hui ?\n"
        "- Quel est le taux de réussite ?\n"
        "- Quelle est la confiance OCR ?\n"
        "- Quels sont les derniers scans ?\n"
        "- Quels sont les types de documents ?\n"
        "- Combien d'utilisateurs ?"
    )
    help_en = (
        "I can answer these questions:\n"
        "- How many scans?\n"
        "- How many today?\n"
        "- What is the success rate?\n"
        "- What is the OCR confidence?\n"
        "- What are the recent scans?\n"
        "- What are the document types?\n"
        "- How many users?"
    )
    return jsonify(_respond(help_fr if lang == "fr" else help_en, "help"))