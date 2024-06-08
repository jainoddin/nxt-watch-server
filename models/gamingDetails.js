const mongoose = require("mongoose");
const Register = new mongoose.Schema({
  video_url: { type: String, required: true },
  video_title: { type: String, required: true },
  description: { type: String, required: true },
  views_count: { type: String },
  published_date: { type: String, required: true },
  channel_logo: { type: String, required: true },

  channel_name: { type: String, required: true },
  subscribers: { type: String, required: true },
  category: { type: String, required: true },
  thumbnail_url: { type: String, required: true },
  saved: { type: String, required: true },
  liked: { type: String, required: true },
});
const gamingDetails = mongoose.model("gamingdetails", Register);
module.exports = gamingDetails;
