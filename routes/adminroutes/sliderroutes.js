const express = require('express');
const router = express.Router();
const sliderController = require('../../controllers/adminControllers/sliderController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const bannerImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/banner_images';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// File filter to accept only image files (JPEG, PNG, GIF)
const bannerImageFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

// Multer upload setup for banner image
const bannerImageUpload = multer({
    storage: bannerImageStorage,
    fileFilter: bannerImageFileFilter,
});

// Slider routes
router.post('/createSlider', bannerImageUpload.single('banner_image'), sliderController.createSlider);
router.get('/sliders', sliderController.getAllSliders);
router.put('/sliders/:id', bannerImageUpload.single('banner_image'), sliderController.updateSlider);
router.delete('/sliders/:id', sliderController.deleteSlider);

module.exports = router;
