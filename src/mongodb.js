const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/webdevproject")
.then(()=>{
    console.log("mongoDB database connection successful");
})
.catch(() =>{
    console.log("mongoDB unsuccessful");
})

const hotelSchema = new mongoose.Schema({
    hotelName: {
        type: String,
        required: true,
    },
    hotelId: {
        type: String,
        required: true,
    },
    reviewScore: {
        type: Number,
        required: true,
    },
    price: {
        type: String, // or whatever data type is appropriate for the price
        required: true,
    }
});


const LogInSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    favourites: [hotelSchema]
})

const collection = new mongoose.model("Collection1", LogInSchema)

module.exports = collection
