const {Schema, model} = require("mongoose");

const artistSchema = Schema({
    name:{
        type:String,
        required:true
    },
    description: String,
    image:{
        type: String,
        default: "artist.png"
    },
    created_at:{
        type:Date,
        default:Date.now
    }
})

module.exports = model("Artist",artistSchema,"artists")