from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)

from extensions import db
from models import User
from utils.auth import role_required


auth_bp = Blueprint("auth", __name__)


def _user_payload(user):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "department": user.department,
    }


def _make_tokens(user):
    additional_claims = {"role": user.role, "email": user.email}
    access = create_access_token(
        identity=user.id, additional_claims=additional_claims
    )
    refresh = create_refresh_token(
        identity=user.id, additional_claims=additional_claims
    )
    return access, refresh


@auth_bp.post("/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    full_name = (data.get("full_name") or "").strip()
    role = data.get("role", "agent")
    department = data.get("department")

    if not email or not password or not full_name:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "email, password et full_name sont obligatoires.",
                }
            ),
            400,
        )

    if role not in {"admin", "agent", "viewer"}:
        return jsonify({"success": False, "error": "Rôle invalide."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "error": "Cet email est déjà utilisé."}), 409

    user = User(
        email=email,
        full_name=full_name,
        role=role,
        department=department,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    access, refresh = _make_tokens(user)
    return (
        jsonify(
            {
                "success": True,
                "user": _user_payload(user),
                "access_token": access,
                "refresh_token": refresh,
            }
        ),
        201,
    )


@auth_bp.post("/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return (
            jsonify({"success": False, "error": "Email et mot de passe requis."}),
            400,
        )

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return (
            jsonify({"success": False, "error": "Identifiants invalides."}),
            401,
        )

    if not user.is_active:
        return jsonify({"success": False, "error": "Compte désactivé."}), 403

    user.last_login_at = datetime.utcnow()
    db.session.commit()

    access, refresh = _make_tokens(user)
    return jsonify(
        {
            "success": True,
            "user": _user_payload(user),
            "access_token": access,
            "refresh_token": refresh,
        }
    )


@auth_bp.get("/auth/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "error": "Utilisateur introuvable."}), 404
    return jsonify({"success": True, "user": _user_payload(user)})


@auth_bp.get("/admin/users")
@role_required("admin")
def list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({"success": True, "users": [u.to_dict() for u in users]})
@auth_bp.post("/admin/users")
@role_required("admin")
def create_user():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    full_name = (data.get("full_name") or "").strip()
    role = data.get("role", "agent")
    department = data.get("department")

    if not email or not password or not full_name:
        return (
            jsonify({"success": False, "error": "email, password et full_name sont requis."}),
            400,
        )

    if role not in {"admin", "agent", "viewer"}:
        return jsonify({"success": False, "error": "Rôle invalide."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "error": "Cet email est déjà utilisé."}), 409

    user = User(
        email=email,
        full_name=full_name,
        role=role,
        department=department,
    )
    user.set_password(password)
    db.session.add(user)

    from models import AuditLog
    audit = AuditLog(
        action="user.create",
        entity_type="user",
        entity_id=user.id,
        ip_address=request.remote_addr,
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({"success": True, "user": user.to_dict()}), 201


@auth_bp.patch("/admin/users/<user_id>")
@role_required("admin")
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "error": "Utilisateur introuvable."}), 404

    data = request.get_json(silent=True) or {}

    if "full_name" in data:
        user.full_name = data["full_name"]
    if "role" in data and data["role"] in {"admin", "agent", "viewer"}:
        user.role = data["role"]
    if "department" in data:
        user.department = data["department"]
    if "is_active" in data:
        user.is_active = bool(data["is_active"])

    from models import AuditLog
    audit = AuditLog(
        action="user.update",
        entity_type="user",
        entity_id=user.id,
        ip_address=request.remote_addr,
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({"success": True, "user": user.to_dict()})


@auth_bp.delete("/admin/users/<user_id>")
@role_required("admin")
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "error": "Utilisateur introuvable."}), 404

    from flask_jwt_extended import get_jwt_identity
    current_id = get_jwt_identity()
    if current_id == user_id:
        return (
            jsonify({"success": False, "error": "Vous ne pouvez pas vous supprimer vous-même."}),
            400,
        )

    db.session.delete(user)

    from models import AuditLog
    audit = AuditLog(
        action="user.delete",
        entity_type="user",
        entity_id=user_id,
        ip_address=request.remote_addr,
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({"success": True, "message": "Utilisateur supprimé."})
@auth_bp.post("/auth/change-password")
@jwt_required()
def change_password():
    from flask_jwt_extended import get_jwt_identity

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "error": "Utilisateur introuvable."}), 404

    data = request.get_json(silent=True) or {}
    old_password = data.get("old_password") or ""
    new_password = data.get("new_password") or ""

    if not old_password or not new_password:
        return jsonify({"success": False, "error": "Ancien et nouveau mot de passe requis."}), 400

    if len(new_password) < 6:
        return jsonify({"success": False, "error": "Le mot de passe doit contenir au moins 6 caractères."}), 400

    if not user.check_password(old_password):
        return jsonify({"success": False, "error": "Ancien mot de passe incorrect."}), 401

    user.set_password(new_password)
    db.session.commit()

    return jsonify({"success": True, "message": "Mot de passe modifié avec succès."})