const mongoose = require('mongoose');
const { User } = require('./user');

const bankSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // reference to user model
        ref: User,  
        required: true
    },

    balance: {
        type: Number,
        required: true
    }
})

const Account = mongoose.model('Account', bankSchema)

module.exports = {
    Account
}