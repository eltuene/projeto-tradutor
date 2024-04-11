import sys
import os
from PIL import Image
import pytesseract
from transformers import MarianMTModel, MarianTokenizer
import torch
import spacy

nlp = spacy.load("en_core_web_sm")

def translate_image(image_path):
    pytesseract.pytesseract.tesseract_cmd = ('C:/Program Files/Tesseract-OCR/Tesseract.exe')
    # Carregando a imagem
    image = Image.open(image_path)

    # Usando pytesseract para extrair o texto da imagem
    extracted_text = pytesseract.image_to_string(image)

    # Separando o texto em sentenças
    doc = nlp(extracted_text)
    sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]

    # Especificando o modelo de tradução
    model_name = "Helsinki-NLP/opus-mt-tc-big-en-pt"

    # Carregando o modelo e o tokenizador
    model = MarianMTModel.from_pretrained(model_name)
    tokenizer = MarianTokenizer.from_pretrained(model_name)

    # Verificando e movendo o modelo para a GPU, se disponível
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)

    # Traduzindo em partes, se o texto for muito longo
    translated_text_parts = []
    for sentence in sentences:
        tokenized_text = tokenizer(sentence, return_tensors="pt", padding=True).to(model.device)
        translated = model.generate(**tokenized_text)
        translated_sentence = tokenizer.decode(translated[0], skip_special_tokens=True)
        translated_text_parts.append(translated_sentence)

    translated_text = '\n'.join(translated_text_parts)
    print(translated_text)

    # Salvando o texto traduzido
    # save_translated_text(translated_text, image_path)

def save_translated_text(translated_text, name):
    # Verificando se a pasta existe, senão cria
    directory = "translated_texts"
    if not os.path.exists(directory):
        os.makedirs(directory)

    # Definindo o nome do arquivo
    filename = os.path.join(directory, f"translated_text_{name}.txt")

    # Salvando o texto traduzido no arquivo
    with open(filename, 'w', encoding='utf-8') as file:
        file.write(translated_text)
    print(f"Texto traduzido salvo em {filename}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python translate_image_text.py <nome_da_imagem>")
        sys.exit(1)
    else:
        image_path = sys.argv[1]

        translate_image(image_path)
