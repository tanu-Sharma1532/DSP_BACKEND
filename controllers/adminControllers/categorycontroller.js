const Category = require('../../models/adminModel/categoryModel');

// Create a new category with image upload
exports.createCategory = async (req, res) => {
    try {
        // Handle image upload if available
        if (req.file) {
            req.body.cat_image = `/uploads/category_images/${req.file.filename}`;
        }

        // Create and save the category
        const newCategory = new Category(req.body);
        const savedCategory = await newCategory.save();

        res.status(201).json({ success: true, message: 'Category created successfully.', data: savedCategory });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Error creating category.', error: error.message });
    }
};

// Update category by ID with image upload
exports.updateCategoryById = async (req, res) => {
    try {
        // Handle image upload if present
        if (req.file) {
            req.body.cat_image = `/uploads/category_images/${req.file.filename}`;
        }

        // Find and update the category
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.status(200).json({ success: true, message: 'Category updated successfully.', data: updatedCategory });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: 'Error updating category.', error: error.message });
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Error fetching categories.', error: error.message });
    }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ success: false, message: 'Error fetching category.', error: error.message });
    }
};

// Delete category by ID
exports.deleteCategoryById = async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }
        res.status(200).json({ success: true, message: 'Category deleted successfully.' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'Error deleting category.', error: error.message });
    }
};

exports.getCategoriesInAscending = async (req, res) => {
    try {
        // Fetch all categories sorted by cat_name in ascending order
        const categories = await Category.find()
            .sort({ cat_name: 1 }); // 1 for ascending order

        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: 'No categories found.' });
        }

        // Send the response with the fetched categories
        res.status(200).json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories.', error: error.message });
    }
};
