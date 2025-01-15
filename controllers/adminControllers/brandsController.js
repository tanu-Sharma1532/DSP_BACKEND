const Brand = require('../../models/adminModel/brandModel');
const Offer = require('../../models/adminModel/offerModel');

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
                select: 'cat_name', // Only select cat_name from category
            })
            .populate({
                path: 'subcategory',
                select: 'sub_cat_name sub_cat_image', // Only select sub_cat_name and sub_cat_image from subcategory
                justOne: true
            });
         console.log("brands",brands);
        // Adding total_live_offers count for each brand
        for (let brand of brands) {
            const totalLiveOffers = await Offer.countDocuments({
                brand: brand._id,
                offer_status: 'live'
            });
            brand.total_live_offers = totalLiveOffers; // Adding the count to the brand object

            // Flatten the category into cat_name
            brand.cat_name = brand.category.cat_name;

            // Flatten the subcategory into sub_cat_name and sub_cat_image
            brand.sub_cat_name = brand.subcategory.sub_cat_name;
            brand.sub_cat_image = brand.subcategory.sub_cat_image;

            // Remove the populated category and subcategory objects
            delete brand.category;
            delete brand.subcategory;
        }

        // Log the processed brands to the console
        console.log('Processed Brands:', brands);

        // Send the final response with the required structure
        res.status(200).json({
            success: true,
            data: brands.map(brand => ({
                _id: brand._id,
                brand_name: brand.brand_name,
                cat_name: brand.cat_name, // Flattened category name
                sub_cat_name: brand.sub_cat_name, // Flattened subcategory name
                sub_cat_image: brand.sub_cat_image, // Flattened subcategory image
                brand_image: brand.brand_image,
                brand_status: brand.brand_status,
                total_live_offers: brand.total_live_offers // Include the total live offer count
            }))
        });
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

exports.getBrandsinascending = async (req, res) => {
    try {
        // Fetch all brands sorted by brand_name in ascending order
        const brands = await Brand.find()
            .sort({ brand_name: 1 }) // 1 for ascending order
            .populate('category', 'cat_name') // Populate the category with only the cat_name field
            .populate('subcategory', 'sub_cat_name'); // Populate the subcategory with only the sub_cat_name field

        if (!brands || brands.length === 0) {
            return res.status(404).json({ message: 'No brands found.' });
        }

        // Flatten category and subcategory information
        brands.forEach(brand => {
            brand.cat_name = brand.category.cat_name; // Flatten the category name
            brand.sub_cat_name = brand.subcategory.sub_cat_name; // Flatten the subcategory name
            // Remove the populated category and subcategory objects
            delete brand.category;
            delete brand.subcategory;
        });

        // Send the response with the flattened brands
        res.status(200).json({
            success: true,
            brands: brands.map(brand => ({
                _id: brand._id,
                brand_name: brand.brand_name,
                cat_name: brand.cat_name, // Direct cat_name field
                sub_cat_name: brand.sub_cat_name, // Direct sub_cat_name field
                brand_image: brand.brand_image,
                brand_status: brand.brand_status,
                total_live_offers: brand.total_live_offers
            }))
        });
    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json({ success: false, message: 'Error fetching brands.', error: error.message });
    }
};


