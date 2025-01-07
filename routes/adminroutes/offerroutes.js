const express = require('express');
const router = express.Router();
const multer = require('multer');
const offerController = require('../../controllers/adminControllers/offercontroller'); // Adjust the path as needed

// Configure Multer to store files in memory
const storage = multer.memoryStorage(); // Store file in memory as a buffer
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

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
