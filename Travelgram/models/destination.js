var mongoose = require("mongoose");

var destinationSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   cost: Number,
   location: String,
   lat: Number,
   lng: Number,
   createdAt: { type: Date, default: Date.now },
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Destination", destinationSchema);