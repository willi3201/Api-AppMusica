const {Schema, model} = require("mongoose");

const albumSchema = Schema({
    artist: {
        type: Schema.ObjectId,
        ref: "Artist"
    },
    title: {
        type: String,
        required:true
    },
    description: String,
    year: {
        type:Number,
        required:true
    },
    image: {
        type:String,
        default:"album.png"
    },
    create_at: {
        type: Date,
        default: Date.now()
    }
});

module.exports = model("Album",albumSchema,"albums");