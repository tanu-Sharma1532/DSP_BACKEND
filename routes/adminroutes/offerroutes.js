const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const offerController = require('../../controllers/adminControllers/offerController'); // Adjust the path as needed

// Path to save banner images
const bannerImagesPath = 'uploads/banner_images';

// Check if the folder exists, and create it if not
if (!fs.existsSync(bannerImagesPath)) {
    fs.mkdirSync(bannerImagesPath, { recursive: true });
}

// Configure storage for the banner image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, bannerImagesPath); // Path to save banner images
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
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

// Multer upload setup for the banner image
const upload = multer({ storage, fileFilter });

// Routes
router.post('/submitOffer', 
    upload.single('banner_image'), 
    offerController.createOffer
);

router.get('/offers', offerController.getAllOffers);
router.get('/:id', offerController.getOfferById);
router.delete('/:id', offerController.deleteOfferById);
router.put('/:id', 
    upload.single('banner_image'), 
    offerController.updateOfferById
);

module.exports = router;
