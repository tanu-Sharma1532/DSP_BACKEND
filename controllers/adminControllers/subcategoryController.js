const SubCategory = require('../../models/adminModel/subcategoryModel');
const path = require('path');

exports.createSubCategory = async (req, res) => {
    try {
        // Handle image upload if available
        if (req.file) {
            req.body.sub_cat_image = `/uploads/subcategory_images/${req.file.filename}`;
        }

        // Create and save the subcategory
        const newSubCategory = new SubCategory(req.body);
        const savedSubCategory = await newSubCategory.save();

        res.status(201).json({
            success: true,
            message: 'Subcategory created successfully.',
            data: savedSubCategory
        });
    } catch (error) {
        console.error('Error creating subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating subcategory.',
            error: error.message
        });
    }
};

exports.getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find().populate('category');
        res.status(200).json({
            success: true,
            data: subCategories
        });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subcategories.',
            error: error.message
        });
    }
};

exports.getSubCategoryById = async (req, res) => {
    try {
        const subCategory = await SubCategory.findById(req.params.id).populate('category');
        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found.'
            });
        }
        res.status(200).json({
            success: true,
            data: subCategory
        });
    } catch (error) {
        console.error('Error fetching subcategory by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subcategory.',
            error: error.message
        });
    }
};

exports.updateSubCategoryById = async (req, res) => {
    try {
        // Handle image upload if present
        if (req.file) {
            req.body.sub_cat_image = `/uploads/subcategory_images/${req.file.filename}`;
        }

        // Find and update the subcategory
        const updatedSubCategory = await SubCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedSubCategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subcategory updated successfully.',
            data: updatedSubCategory
        });
    } catch (error) {
        console.error('Error updating subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating subcategory.',
            error: error.message
        });
    }
};

exports.deleteSubCategoryById = async (req, res) => {
    try {
        const deletedSubCategory = await SubCategory.findByIdAndDelete(req.params.id);

        if (!deletedSubCategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subcategory deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting subcategory.',
            error: error.message
        });
    }
};

exports.getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Validate categoryId
        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required.' });
        }

        // Find subcategories by category ID
        const subcategories = await SubCategory.find({ category: categoryId });

        // Check if subcategories exist
        if (!subcategories.length) {
            return res.status(404).json({ message: 'No subcategories found for this category.' });
        }

        return res.status(200).json({ message: 'Subcategories retrieved successfully.', subcategories });
    } catch (error) {
        console.error('Error retrieving subcategories:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};



