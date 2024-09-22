require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req,res,next) =>{
    req.time = new Date(Date.now()).toString();
    console.log(req.method,req.hostname, req.path, req.time);
    next();
});

app.get('/greet', (req, res) => {
    res.send('Hello, Welcome to SuperPay Product Manager!');
})

app.get('/products',authenticateToken , async(req, res) => {
    try {
        const products = await Product.find({})
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

app.get('/products/:id', authenticateToken, async(req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({message: error.message});

    }
})

app.post('/products', authenticateToken, async(req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(200).json(product);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message});
    }
})
//update a product
app.put('/products/:id', authenticateToken, async(req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body);
        if(!product){
            return res.status(400).json({message: `Product with ID: ${id} is not found`});
        }
        const updatedProduct = await Product.findById(id);
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})
//delete a product
app.delete('/products/:id', authenticateToken, async(req, res) => {
    try {
        const {id} = req.params;
        const product = await Product.findByIdAndDelete(id);
        if(!product){
            return res.status(400).json({message: `Product with ID: ${id} is not found`});
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})



//middleware to verify token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}


mongoose.connect('mongodb+srv://admin:adminali@nodeapi.14eyy.mongodb.net/NodeAPI?retryWrites=true&w=majority&appName=NodeAPI')
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(3002, () => {
        console.log('Product Service API is running on port 3002'); 
    })
}).catch((error) => {
    console.log(error);
})