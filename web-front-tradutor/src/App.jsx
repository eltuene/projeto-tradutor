import { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('pt');
  const [audioUrl, setAudioUrl] = useState(null);
  const languages = [{ key: 'es', value: 'Espanhol' }, { key: 'pt', value: 'Português' }, { key: 'fr', value: 'Francês' }];

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreviewUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*', maxFiles: 1 });

  const translateImage = async () => {
    if (file && selectedLanguage) {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", file);
  
      const url = new URL(`${import.meta.env.VITE_API_URL}/translate`);
      url.search = new URLSearchParams({ sourceLang: 'en', targetLang: selectedLanguage }).toString();
  
      try {
        const response = await axios.post(
          url.href,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.status === 200) {
          setTranslatedText(response.data);
        } else {
          console.error("Erro ao traduzir imagem");
        }
      } catch (error) {
        console.error("Error: ", error);
      }
      setLoading(false);
    }
  }

  const fetchAudio = async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_URL}/text-to-speech?filename=${file.name}`;
    try {
      const response = await axios.get(url, { responseType: 'blob' });
      const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
      const audio = URL.createObjectURL(audioBlob);
      setAudioUrl(audio);
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <div className={`container ${imagePreviewUrl ? 'flex-row' : ''}`}>
        <div className='dropzone-container'>
          <div className="title-container">
            <h1>Inglês para:</h1>
            <select value={selectedLanguage} onChange={handleLanguageChange}>
              {languages.map((language) => (
                <option key={language.key} value={language.key}>
                  {language.value}
                </option>
              ))}
            </select>
          </div>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <p>{isDragActive ? "Solte a imagem aqui" : "Arraste e solte uma imagem aqui, ou clique para selecionar uma imagem"}</p>
          </div>

          {imagePreviewUrl && (
            <img src={imagePreviewUrl} alt="Preview" className="image-preview" />
          )}
          <button onClick={translateImage} disabled={!file || loading}>
            {loading ? 'Traduzindo...' : 'Traduzir'}
          </button>
          <button onClick={fetchAudio} disabled={!file || loading || !translatedText}>
            {loading ? 'Obtendo Áudio...' : 'Obter Áudio'}
          </button>
          {audioUrl && (
          <audio controls src={audioUrl}>
            Seu navegador não suporta o elemento de áudio.
          </audio>
        )}
        </div>
        {translatedText && (
          <div className="translation">
            <h3>Texto Traduzido:</h3>
            <p>{translatedText}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
