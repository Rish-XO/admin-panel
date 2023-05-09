const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'password cannot be blank']
    },
    role: {
        type : String
    }
})


module.exports = mongoose.model('User', userSchema)