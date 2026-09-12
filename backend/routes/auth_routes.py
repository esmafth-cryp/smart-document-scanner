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