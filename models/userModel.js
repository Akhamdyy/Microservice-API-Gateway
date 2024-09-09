const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please enter an email"],
    },
    username: {
        type: String,
        required: [true, "Please enter a username"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: 8
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User; 