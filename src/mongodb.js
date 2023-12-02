const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/webdevproject")
.then(()=>{
    console.log("mongoDB database connection successful");
})
.catch(() =>{
    console.log("mongoDB unsuccessful");
})

const LogInSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const collection = new mongoose.model("Collection1", LogInSchema)

module.exports = collection
