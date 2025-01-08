const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const subCategoryController = require('../../controllers/adminControllers/subcategoryController');

// Configure storage for subcategory images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/subcategory_images';

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        // Proceed with the file upload
        cb(null, uploadPath);
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

// Multer upload setup for the subcategory image
const upload = multer({ storage, fileFilter });

// Define routes
router.post('/submitSubCategory', upload.single('sub_cat_image'), subCategoryController.createSubCategory);
router.get('/subCategories', subCategoryController.getAllSubCategories);
router.get('/getSubCategory/:id', subCategoryController.getSubCategoryById);
router.put('/subCategories/:id', upload.single('sub_cat_image'), subCategoryController.updateSubCategoryById);
router.delete('/subCategories/:id', subCategoryController.deleteSubCategoryById);
router.get('/subCategoriesbyCat/:categoryId',subCategoryController.getSubcategoriesByCategory);

module.exports = router;
