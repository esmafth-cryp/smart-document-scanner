from paddleocr import PaddleOCR

print("Chargement du modèle OCR...")

ocr = PaddleOCR(
    lang="fr",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
)

print("Modèle OCR prêt.")


def extract_text(image_path):
    results = ocr.predict(image_path)

    detected_lines = []

    for result in results:
        result_data = result.json

        if callable(result_data):
            result_data = result_data()

        if "res" in result_data:
            result_data = result_data["res"]

        texts = result_data.get("rec_texts", [])
        scores = result_data.get("rec_scores", [])

        for index, text in enumerate(texts):
            cleaned_text = text.strip()

            if not cleaned_text:
                continue

            score = scores[index] if index < len(scores) else None

            detected_lines.append(
                {
                    "text": cleaned_text,
                    "confidence": (
                        round(float(score), 4)
                        if score is not None
                        else None
                    ),
                }
            )

    full_text = "\n".join(
        line["text"] for line in detected_lines
    )

    return {
        "text": full_text,
        "lines": detected_lines,
    }