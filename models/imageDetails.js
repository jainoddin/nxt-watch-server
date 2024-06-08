const mongoose = require("mongoose");
const Register = new mongoose.Schema({
  user_id: { type: String, required: true },
  image: { type: String, required: true },
 
});
const imageDetails = mongoose.model("imagedata", Register);
module.exports = imageDetails;