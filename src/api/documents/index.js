const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../../middlewares/authMiddleware');

const documentsApi = () => {
  const router = express.Router();

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Hanya file PDF yang diperbolehkan!')); 
      }
    }
  });

  router.post('/', authMiddleware, upload.single('document'), (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'File dokumen tidak ditemukan atau format tidak sesuai' 
        });
      }

      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      res.status(201).json({
        status: 'success',
        message: 'Dokumen berhasil diunggah',
        data: { fileUrl },
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', authMiddleware, (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Dokumen berhasil dihapus',
    });
  });

  return router;
};

module.exports = documentsApi;