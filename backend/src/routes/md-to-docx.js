const express = require('express');
const multer = require('multer');
const path = require('path');
const { convertMdToDocx } = require('../controllers/mdToDocx');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post(
  '/',
  upload.fields([{ name: 'md', maxCount: 1 }, { name: 'template', maxCount: 1 }]),
  convertMdToDocx
);

module.exports = router;
