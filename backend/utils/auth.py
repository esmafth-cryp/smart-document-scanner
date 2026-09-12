from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def role_required(*allowed_roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role", "viewer")
            if user_role not in allowed_roles:
                return (
                    jsonify(
                        {
                            "success": False,
                            "error": "Accès refusé. Rôle insuffisant.",
                        }
                    ),
                    403,
                )
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def current_user_id():
    from flask_jwt_extended import get_jwt_identity

    return get_jwt_identity()


def current_user_role():
    claims = get_jwt()
    return claims.get("role", "viewer")