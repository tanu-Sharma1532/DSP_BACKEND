const mongoose = require('mongoose');

const url = 'mongodb+srv://dsp91:tvaml0XcMkTOIwqL@dsp.cjqbl.mongodb.net/?retryWrites=true&w=majority&appName=Dsp';

// Connect to MongoDB
mongoose.connect(url)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
