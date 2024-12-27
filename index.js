const express = require('express');

const app = express();
const multer = require('multer');
const path = require('path');
var cors = require('cors');
app.use(cors());
require('./db');
const port = 3000;
const userRoutes = require('./routes/userRoutes');

app.use('/static', express.static(path.join(__dirname, 'public')));


app.use(express.json());
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

app.use('/users', userRoutes);

app.listen(port, () => {
    console.log("listening on port" + port);
});