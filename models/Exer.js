const mongoose = require('mongoose')

const exerSchema = mongoose.Schema({

    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
    
    description: String,
    duration: Number,
    date: Date
})
const Exer = mongoose.model('Exer', exerSchema)
module.exports= Exer
