const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/adminControllers/categorycontroller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for category image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/category_images';
        
        // Check if the folder exists, if not create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath); // Set the upload folder path
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter to accept only image files (JPEG, PNG, GIF)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

// Multer upload setup for category image
const upload = multer({ storage, fileFilter });

router.post('/createCategory', upload.single('cat_image'), categoryController.createCategory);

router.get('/categories', categoryController.getAllCategories);

router.get('/categories/:id', categoryController.getCategoryById);

router.put('/categories/:id', upload.single('cat_image'), categoryController.updateCategoryById);

router.delete('/categories/:id', categoryController.deleteCategoryById);

module.exports = router;
