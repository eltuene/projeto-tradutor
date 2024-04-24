import { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreviewUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive  } = useDropzone({ onDrop, accept: 'image/*', maxFiles: 1 });

  const translateImage = async () => {
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/translate`,
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

  return (
    <div className="App">
      <div className={`container ${imagePreviewUrl ? 'flex-row' : ''}`}>
        <div className='dropzone-container'>
        <h1>Traduzir Inglês para Português</h1>
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
