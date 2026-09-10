from services.parser_service import parse_document

text = """
DECISION DE STAGE

Casablanca, le 10/04/2026

DECISION N° 57/DAF/2026

STAGE DE PASSAGE

Vu la demande de stage de Mademoiselle ASMAA FETHANI.

Mademoiselle ASMAA FETHANI est autorisée à effectuer un stage d'un mois à la Division Systèmes d'Information, et ce à compter du 01/07/2026.

Marsa Maroc
"""

print(parse_document(text))