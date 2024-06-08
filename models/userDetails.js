const mongoose = require("mongoose");
const Register = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});
const userDetails = mongoose.model("userdata", Register);
module.exports = userDetails;