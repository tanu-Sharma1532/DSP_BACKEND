const express = require('express');

const app = express();
const multer = require('multer');
const path = require('path');
var cors = require('cors');
app.use(cors());
require('./db');
const port = 3000;
const userRoutes = require('./routes/userRoutes');
const offerRoutes = require('./routes/adminroutes/offerroutes');
const categoryRoutes = require('./routes/adminroutes/categoryroutes');
const subcategoryRoutes = require('./routes/adminroutes/subcategoryroutes');
const brandRoutes = require('./routes/adminroutes/brandroutes');
const adminsignlogroutes = require('./routes/adminroutes/LoginSignuproutes');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.json());
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

app.use('/users', userRoutes);
app.use('/admin/offer',offerRoutes);
app.use('/admin/category',categoryRoutes);
app.use('/admin/subcategory',subcategoryRoutes);
app.use('/admin/brand',brandRoutes);
app.use('/admin/auth',adminsignlogroutes);

app.listen(port, () => {
    console.log("listening on port" + port);
});