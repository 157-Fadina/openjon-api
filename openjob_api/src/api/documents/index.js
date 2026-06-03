const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../../middlewares/authMiddleware');

const documentsApi = (documentsService) => {
  const router = express.Router();

  const uploadDir = path.resolve('uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

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
        cb(new Error('INVALID_TYPE')); 
      }
    }
  });

  const uploadMiddleware = (req, res, next) => {
    const uploadSingle = upload.single('document');
    uploadSingle(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ status: 'fail', message: 'Ukuran berkas maksimal 5 MB' });
        }
        if (err.message === 'INVALID_TYPE') {
          return res.status(400).json({ status: 'fail', message: 'Hanya file PDF yang diperbolehkan!' });
        }
        return res.status(400).json({ status: 'fail', message: 'Terjadi kesalahan saat upload' });
      }
      next();
    });
  };

  router.post('/', authMiddleware, uploadMiddleware, async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'File dokumen tidak ditemukan' 
        });
      }

      const fileName = req.file.filename;
      const filePath = `/uploads/${fileName}`;

      const documentId = await documentsService.addDocument(fileName, filePath);

      const fileUrl = `${req.protocol}://${req.get('host')}${filePath}`;

      res.status(201).json({
        status: 'success',
        message: 'Dokumen berhasil diunggah',
        data: { 
          id: documentId,
          fileUrl 
        },
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