import re
import unicodedata


def normalize_text(text: str) -> str:
    """
    Nettoie le texte OCR sans supprimer les informations utiles.
    """
    if not text:
        return ""

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Supprimer les espaces inutiles à l'intérieur des lignes
    text = re.sub(r"[ \t]+", " ", text)

    # Limiter les lignes vides répétées
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def remove_accents(text: str) -> str:
    """
    Retourne une version du texte sans accents.
    """
    normalized = unicodedata.normalize("NFD", text)

    return "".join(
        character
        for character in normalized
        if unicodedata.category(character) != "Mn"
    )


def clean_value(value: str) -> str:
    """
    Nettoie une valeur extraite par une expression régulière.
    """
    if not value:
        return ""

    value = re.sub(r"\s+", " ", value)

    return value.strip(" .,:;-\n\t")


def find_first(
    patterns: list[str],
    text: str,
) -> str | None:
    """
    Teste plusieurs expressions régulières et retourne
    la première valeur trouvée.
    """
    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE | re.MULTILINE,
        )

        if match:
            return clean_value(match.group(1))

    return None


def detect_document_type(text: str) -> str:
    """
    Détecte le type du document.
    """
    normalized = remove_accents(text).lower()

    if (
        "decision de stage" in normalized
        or "stage de passage" in normalized
    ):
        return "Décision de stage"

    if "facture" in normalized:
        return "Facture"

    if "attestation" in normalized:
        return "Attestation"

    if "contrat" in normalized:
        return "Contrat"

    if "passeport" in normalized:
        return "Passeport"

    if (
        "carte nationale" in normalized
        or "identite nationale" in normalized
    ):
        return "Carte nationale d'identité"

    return "Document non identifié"


def extract_reference(text: str) -> str | None:
    """
    Extrait une référence comme 57/DAF/2026.

    Accepte notamment :
    N°
    Nº
    NO
    N
    No
    """
    patterns = [
        (
            r"\bDECISION\s*"
            r"(?:N\s*[°ºoO0]?|NUM[ÉE]RO)?"
            r"\s*[:\-]?\s*"
            r"(\d+\s*/\s*[A-ZÀ-ÖØ-Ý]+\s*/\s*\d{4})"
        ),
        (
            r"\bR[ÉE]F[ÉE]RENCE\s*"
            r"[:\-]?\s*"
            r"([A-Z0-9À-ÖØ-Ý/\-]+)"
        ),
        (
            r"\bR[ÉE]F\.?\s*"
            r"[:\-]?\s*"
            r"([A-Z0-9À-ÖØ-Ý/\-]+)"
        ),
        r"\b(\d+\s*/\s*[A-ZÀ-ÖØ-Ý]{2,}\s*/\s*\d{4})\b",
    ]

    value = find_first(patterns, text)

    if not value:
        return None

    # Supprimer les espaces autour des /
    value = re.sub(r"\s*/\s*", "/", value)

    return value.upper()


def extract_document_date(text: str) -> str | None:
    """
    Extrait la date du document.
    """
    patterns = [
        (
            r"\bCasablanca\s*,?\s*"
            r"le\s+"
            r"(\d{1,2}/\d{1,2}/\d{4})"
        ),
        r"\ble\s+(\d{1,2}/\d{1,2}/\d{4})",
        r"\b(\d{1,2}/\d{1,2}/\d{4})\b",
    ]

    return find_first(patterns, text)


def extract_student_name(text: str) -> str | None:
    """
    Extrait le nom de la stagiaire ou du stagiaire.
    """
    patterns = [
        (
            r"(?:Mademoiselle|Madame|Monsieur|Mlle|Mme|M\.)"
            r"\s+"
            r"([A-ZÀ-ÖØ-Ý][A-ZÀ-ÖØ-Ý\-']+"
            r"(?:\s+[A-ZÀ-ÖØ-Ý][A-ZÀ-ÖØ-Ý\-']+){1,4})"
            r"\s+est\s+autoris"
        ),
        (
            r"demande\s+de\s+stage\s+de\s+"
            r"(?:Mademoiselle|Madame|Monsieur|Mlle|Mme|M\.)?"
            r"\s*"
            r"([A-ZÀ-ÖØ-Ý][A-ZÀ-ÖØ-Ý\-']+"
            r"(?:\s+[A-ZÀ-ÖØ-Ý][A-ZÀ-ÖØ-Ý\-']+){1,4})"
            r"\s*[;,.]"
        ),
    ]

    value = find_first(patterns, text)

    if not value:
        return None

    return value.upper()


def extract_internship_type(text: str) -> str | None:
    """
    Extrait le type de stage.
    """
    normalized = remove_accents(text).lower()

    if "stage de passage" in normalized:
        return "Stage de passage"

    if "stage d'initiation" in normalized:
        return "Stage d'initiation"

    if "stage de fin d'etudes" in normalized:
        return "Stage de fin d'études"

    if "stage pfe" in normalized:
        return "Stage de fin d'études"

    return None


def extract_start_date(text: str) -> str | None:
    """
    Extrait la date de début du stage.
    """
    patterns = [
        (
            r"[ÀA]\s+compter\s+du\s+"
            r"(\d{1,2}/\d{1,2}/\d{4})"
        ),
        (
            r"d[ée]but\s+du\s+stage\s*"
            r"[:\-]?\s*"
            r"(\d{1,2}/\d{1,2}/\d{4})"
        ),
        (
            r"date\s+de\s+d[ée]but\s*"
            r"[:\-]?\s*"
            r"(\d{1,2}/\d{1,2}/\d{4})"
        ),
    ]

    return find_first(patterns, text)


def extract_duration(text: str) -> str | None:
    """
    Extrait la durée du stage.
    """
    patterns = [
        r"stage\s+d['’]?\s*(un|une|\d+)\s+mois",
        r"dur[ée]e\s*[:\-]?\s*(\d+\s+mois)",
    ]

    value = find_first(patterns, text)

    if not value:
        return None

    normalized = remove_accents(value).lower()

    if normalized in {"un", "une"}:
        return "1 mois"

    if re.fullmatch(r"\d+", normalized):
        return f"{normalized} mois"

    return value


def extract_department(text: str) -> str | None:
    """
    Extrait le service ou la division d'affectation.
    """
    patterns = [
        (
            r"stage\s+d['’]un\s+mois\s+"
            r"[àa]\s+la\s+"
            r"(Division\s+[^\n,;.]+)"
        ),
        (
            r"\b"
            r"(Division\s+"
            r"[A-ZÀ-ÖØ-Ýa-zà-öø-ÿ"
            r"\s'’\-]+)"
        ),
        (
            r"\b"
            r"(Service\s+"
            r"[A-ZÀ-ÖØ-Ýa-zà-öø-ÿ"
            r"\s'’\-]+)"
        ),
    ]

    value = find_first(patterns, text)

    if not value:
        return None

    value = re.split(
        r"\bet\s+ce\b|\bà\s+compter\b",
        value,
        maxsplit=1,
        flags=re.IGNORECASE,
    )[0]

    return clean_value(value)


def extract_company(text: str) -> str | None:
    """
    Extrait le nom de l'entreprise.
    """
    normalized = remove_accents(text).lower()

    # Tolérer les espaces ou sauts de ligne entre Marsa et Maroc
    if re.search(r"\bmarsa\s+maroc\b", normalized):
        return "Marsa Maroc"

    # Le logo peut parfois être lu sur deux lignes
    if "marsa" in normalized and "maroc" in normalized:
        return "Marsa Maroc"

    patterns = [
        r"(Soci[ée]t[ée]\s+[^\n]+)",
        r"(Entreprise\s+[^\n]+)",
    ]

    return find_first(patterns, text)


def parse_document(ocr_text: str) -> dict:
    """
    Fonction principale appelée par Flask.
    """
    text = normalize_text(ocr_text)

    return {
        "document_type": detect_document_type(text),
        "document_date": extract_document_date(text),
        "reference": extract_reference(text),
        "student_name": extract_student_name(text),
        "internship_type": extract_internship_type(text),
        "start_date": extract_start_date(text),
        "duration": extract_duration(text),
        "department": extract_department(text),
        "company": extract_company(text),
    }