const mongoose = require('mongoose');




    const mongoose = require('mongoose');

// Connection URL with the database name specified
const url = 'mongodb+srv://dsp91:tvaml0XcMkTOIwqL@dsp.cjqbl.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Dsp';

// Connect to MongoDB
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

