import sys
import os
from PIL import Image
import pytesseract
from transformers import MarianMTModel, MarianTokenizer
import torch
import spacy

nlp = spacy.load("en_core_web_sm")

model_mapping = {
    'en-pt': 'Helsinki-NLP/opus-mt-tc-big-en-pt',
    'en-es': 'Helsinki-NLP/opus-mt-en-es',
    'en-fr': 'Helsinki-NLP/opus-mt-en-fr'
}

def translate_image(image_path, source_lang='en', target_lang='pt'):
    pytesseract.pytesseract.tesseract_cmd = ('C:/Program Files/Tesseract-OCR/Tesseract.exe')
    image = Image.open(image_path)
    extracted_text = pytesseract.image_to_string(image)
    if not extracted_text.strip():
        print("Não foi encontrado texto na imagem. Verifique se a imagem está legível.")
        return

    doc = nlp(extracted_text)
    sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]

    if not sentences:
        print("Não foi possível extrair sentenças do texto da imagem. Verifique se a imagem está legível.")
        return

    model_name = model_mapping.get(f'{source_lang}-{target_lang}', 'Helsinki-NLP/opus-mt-tc-big-en-pt')
    model = MarianMTModel.from_pretrained(model_name)
    tokenizer = MarianTokenizer.from_pretrained(model_name)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)

    translated_text_parts = []
    for sentence in sentences:
        tokenized_text = tokenizer(sentence, return_tensors="pt", padding=True).to(model.device)
        translated = model.generate(**tokenized_text)
        translated_sentence = tokenizer.decode(translated[0], skip_special_tokens=True)
        translated_text_parts.append(translated_sentence)

    translated_text = '\n'.join(translated_text_parts)
    save_translated_text(translated_text)
    print(translated_text)

def save_translated_text(translated_text):
    directory = "translated_texts"
    if not os.path.exists(directory):
        os.makedirs(directory)
    filename = os.path.join(directory, f"translated_text.txt")
    with open(filename, 'w', encoding='utf-8') as file:
        file.write(translated_text)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python translate_image_text.py <nome_da_imagem> <idioma_origem> <idioma_destino>")
        sys.exit(1)
    else:
        image_path = sys.argv[1]
        source_lang = sys.argv[2] if len(sys.argv) > 2 else 'en'
        target_lang = sys.argv[3] if len(sys.argv) > 3 else 'pt'

        translate_image(image_path, source_lang, target_lang)
