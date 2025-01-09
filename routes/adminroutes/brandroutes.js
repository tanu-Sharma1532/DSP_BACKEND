const express = require('express');
const router = express.Router();
const brandController = require('../../controllers/adminControllers/brandsController');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/brand_images';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath); // Save to this directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

const upload = multer({ storage, fileFilter });

router.post('/brands', upload.single('brand_image'), brandController.createBrand);

router.get('/brands', brandController.getBrandsinascending);

router.get('/brands/:id', brandController.getBrandById);

router.put('/brands/:id', upload.single('brand_image'), brandController.updateBrandById);

router.delete('/brands/:id', brandController.deleteBrandById);

// router.get('/ascbrands',brandController.getBrandsinascending);

module.exports = router;
