require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req,res,next) =>{
    req.time = new Date(Date.now()).toString();
    console.log(req.method,req.hostname, req.path, req.time);
    next();
});

let refreshTokens = [];

app.get('/greet/hello', (req, res) => {
    res.send('Hello, Welcome to SuperPay Authentication Service!');
})

app.post('/register', async(req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({email: req.body.email, username:req.body.username, password: hashedPassword});
        res.status(200).json(user);
    } catch (error) {
        console.log(error.message); 
        res.status(500).json({message: error.message});
    }
})

app.post('/login', async(req, res) => {
   const user = await User.findOne({username: req.body.username});
    if (user == null) {
        return res.status(400).send('User not found');
    }
    try {
        if(await bcrypt.compare(req.body.password, user.password)){
            const accessToken = generateAccessToken(user);
            let userData = {
                username: user.username,
            };
            const refreshToken = jwt.sign(userData, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1d'});
            refreshTokens.push(refreshToken);
            res.json({accessToken: accessToken, refreshToken: refreshToken});
        } else {
            return res.send('Not Allowed');
        }
    } catch (error) {
        console.log(error.message); 
        res.status(500).json({message: error.message});
    }
})

app.post('/refresh',(req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) {
        return res.sendStatus(401);
    }
    if (refreshToken.includes(refreshToken)) {
        return res.sendStatus(403);
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken({name: user.name});
        res.json({accessToken: accessToken});
    })
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
})

function generateAccessToken(user) {
    let userData = {
        username: user.username,
    };
    return jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '60s'});
}


mongoose.connect('mongodb+srv://admin:adminali@nodeapi.14eyy.mongodb.net/NodeAPI?retryWrites=true&w=majority&appName=NodeAPI')
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(3001, () => {
        console.log('Auth Service API is running on port 3001'); 
    })
}).catch((error) => {
    console.log(error);
})