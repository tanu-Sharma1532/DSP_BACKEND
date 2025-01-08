const Brand = require('../../models/adminModel/brandModel');

exports.createBrand = async (req, res) => {
    try {
        const { brand_name, category, subcategory } = req.body;

        // Handle image upload if present
        let brand_image;
        if (req.file) {
            brand_image = `/uploads/brand_images/${req.file.filename}`;
        }

        const newBrand = new Brand({ brand_name, category, subcategory, brand_image });
        const savedBrand = await newBrand.save();

        res.status(201).json({ success: true, message: 'Brand created successfully.', data: savedBrand });
    } catch (error) {
        console.error('Error creating brand:', error);
        res.status(500).json({ success: false, message: 'Error creating brand.', error: error.message });
    }
};

exports.getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find()
            .populate({
                path: 'category',
                select: 'cat_name cat_image', // Fetch category name and image
            })
            .populate({
                path: 'subcategory',
                select: 'sub_cat_name sub_cat_image', // Fetch subcategory name and image
                // In case the subcategory is not found, it will return an empty object instead of null
                justOne: true
            });

        res.status(200).json({ success: true, data: brands });
    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json({ success: false, message: 'Error fetching brands.', error: error.message });
    }
};



exports.getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id).populate('category subcategory');
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found.' });
        }
        res.status(200).json({ success: true, data: brand });
    } catch (error) {
        console.error('Error fetching brand:', error);
        res.status(500).json({ success: false, message: 'Error fetching brand.', error: error.message });
    }
};

exports.updateBrandById = async (req, res) => {
    try {
        // Handle image upload if present
        if (req.file) {
            req.body.brand_image = `/uploads/brand_images/${req.file.filename}`;
        }

        const updatedBrand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedBrand) {
            return res.status(404).json({ success: false, message: 'Brand not found.' });
        }

        res.status(200).json({ success: true, message: 'Brand updated successfully.', data: updatedBrand });
    } catch (error) {
        console.error('Error updating brand:', error);
        res.status(500).json({ success: false, message: 'Error updating brand.', error: error.message });
    }
};

exports.deleteBrandById = async (req, res) => {
    try {
        const deletedBrand = await Brand.findByIdAndDelete(req.params.id);

        if (!deletedBrand) {
            return res.status(404).json({ success: false, message: 'Brand not found.' });
        }

        res.status(200).json({ success: true, message: 'Brand deleted successfully.' });
    } catch (error) {
        console.error('Error deleting brand:', error);
        res.status(500).json({ success: false, message: 'Error deleting brand.', error: error.message });
    }
};
