const express = require('express');
const router = express.Router();
const textSliderController = require('../../controllers/adminControllers/textsliderController');

// Routes
router.post('/createTextSlider', textSliderController.createTextSlider);
router.get('/textSliders', textSliderController.getAllTextSliders);
router.get('/textSliders/:id', textSliderController.getTextSliderById);
router.put('/textSliders/:id', textSliderController.updateTextSlider);
router.delete('/textSliders/:id', textSliderController.deleteTextSlider);

module.exports = router;
