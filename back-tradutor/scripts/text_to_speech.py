import pyttsx3
import os

def text_to_speech(text_file='translated_texts/translated_text.txt'):
    if not os.path.exists(text_file):
        return
    
    with open(text_file, 'r', encoding='utf-8') as file:
        text = file.read()

    if not text.strip():
        return

    engine = pyttsx3.init()

    engine.setProperty('rate', 150)  # Velocidade da fala
    engine.setProperty('volume', 0.9)  # Volume (0.0 a 1.0)

    output_file = text_file.replace('.txt', '.mp3')
    engine.save_to_file(text, output_file)
    engine.runAndWait()
    print(f"Audio file saved as {output_file}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 1:
        print("Usage: python text_to_speech.py")
    else:
        text_to_speech()
