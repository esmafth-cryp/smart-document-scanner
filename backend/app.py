from pathlib import Path
from uuid import uuid4

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename

from services.ocr_service import extract_text
from services.parser_service import parse_document


app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ]
        }
    },
)

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"

UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


def allowed_file(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


@app.get("/")
def home():
    return jsonify(
        {
            "success": True,
            "message": "Bienvenue dans Smart Document Scanner.",
        }
    )


@app.get("/api/health")
def health():
    return jsonify(
        {
            "success": True,
            "message": "Le serveur Flask fonctionne correctement.",
        }
    )


@app.post("/api/scan")
def scan_document():
    if "image" not in request.files:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Aucune image n'a été envoyée.",
                }
            ),
            400,
        )

    image = request.files["image"]

    if not image.filename:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Aucun fichier n'a été sélectionné.",
                }
            ),
            400,
        )

    if not allowed_file(image.filename):
        return (
            jsonify(
                {
                    "success": False,
                    "error": (
                        "Format non autorisé. "
                        "Utilisez PNG, JPG ou JPEG."
                    ),
                }
            ),
            400,
        )

    original_filename = secure_filename(image.filename)
    extension = original_filename.rsplit(".", 1)[1].lower()

    saved_filename = f"{uuid4().hex}.{extension}"
    file_path = UPLOAD_FOLDER / saved_filename

    try:
        image.save(file_path)
    except Exception as error:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Impossible d'enregistrer l'image.",
                    "details": str(error),
                }
            ),
            500,
        )

    try:
        ocr_result = extract_text(str(file_path))
    except Exception as error:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "L'analyse OCR a échoué.",
                    "details": str(error),
                }
            ),
            500,
        )

    try:
        document_data = parse_document(
            ocr_result.get("text", "")
        )
    except Exception as error:
        return (
            jsonify(
                {
                    "success": False,
                    "error": (
                        "L'extraction des informations a échoué."
                    ),
                    "details": str(error),
                }
            ),
            500,
        )

    return jsonify(
        {
            "success": True,
            "filename": original_filename,
            "saved_filename": saved_filename,
            "message": "Document analysé avec succès.",
            "text": ocr_result.get("text", ""),
            "lines": ocr_result.get("lines", []),
            "document": document_data,
        }
    )


@app.errorhandler(413)
def file_too_large(_error):
    return (
        jsonify(
            {
                "success": False,
                "error": (
                    "Le fichier est trop volumineux. "
                    "La taille maximale est de 10 Mo."
                ),
            }
        ),
        413,
    )


@app.errorhandler(404)
def page_not_found(_error):
    return (
        jsonify(
            {
                "success": False,
                "error": "Route introuvable.",
            }
        ),
        404,
    )


@app.errorhandler(500)
def internal_server_error(error):
    return (
        jsonify(
            {
                "success": False,
                "error": "Erreur interne du serveur.",
                "details": str(error),
            }
        ),
        500,
    )


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
    )