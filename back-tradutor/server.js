const fs = require("fs");
const express = require("express");
const multer = require('multer');
const { spawn } = require("child_process");
const cors = require('cors'); // Importe o pacote cors

const app = express();
const port = 3000;

app.use(cors()); // Use o middleware cors para permitir todas as origens

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
  console.log(imagePath);

  const pythonProcess = spawn("python", ["scripts/translate_image_text.py", imagePath]);

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
