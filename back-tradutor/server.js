const fs = require("fs");
const express = require("express");
const multer = require('multer');
const { spawn } = require("child_process");
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'scripts/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post("/translate", upload.single('image'), (req, res) => {
  const imagePath = req.file.path;
  const sourceLang = req.query.sourceLang || 'en';
  const targetLang = req.query.targetLang || 'pt';

  console.log(`Traduzindo ${sourceLang} para ${targetLang}`);

  const pythonProcess = spawn("python", ["scripts/translate_image_text.py", imagePath, sourceLang, targetLang]);

  let translatedText = '';
  pythonProcess.stdout.on("data", (data) => {
    translatedText += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on("error", (error) => {
    console.error(`error: ${error.message}`);
    res.status(500).send("Error executing Python script");
  });

  pythonProcess.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    console.log(translatedText);
    res.send(translatedText);

    fs.unlinkSync(imagePath);
  });
});

app.get('/text-to-speech', (req, res) => {
  const filesDir = path.join(__dirname, 'translated_texts');
  const filePath = path.join(filesDir, 'translated_text.txt');
  const outputPath = filePath.replace('.txt', '.mp3');

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found.');
  }

  // Chama o script Python
  const pythonProcess = spawn('python', ['scripts/text_to_speech.py']);

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`Python script exited with code ${code}`);
      return res.status(500).send('Failed to convert text to speech.');
    }

    res.sendFile(outputPath, () => {
      fs.unlinkSync(outputPath);
    });
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
