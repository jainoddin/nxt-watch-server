const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userDetails = require("./models/userDetails");
var app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtAuth = require("./middleware/jwtAuth");
const videoDetails = require("./models/videoDetails");
const gamingDetails = require("./models/gamingDetails");
const imageDetails = require("./models/imageDetails");
const bodyParser = require("body-parser");

const port = process.env.PORT || 4000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Middleware to parse JSON and handle large payloads
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

mongoose
  .connect(
    `mongodb+srv://skjainoddin39854:hngmFxWB8ZLTHpwW@cluster0.lbfgvl4.mongodb.net/synergy-task-nxtwatch?retryWrites=true&w=majority
 JWT_SECRET=tUao3/fmx20gO0uLwpnlJ6t2qzMeOEWAxsIz/OG+3y4=`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000}
  )
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error(err);
  });

app.post("/signup", async (req, res) => {
  try {
    const emailUse = await userDetails.findOne({ email: req.body.email });
    if (emailUse) {
      return res.status(400).send("already email is used");
    }

    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedpassword;

    const userData = new userDetails(req.body);
    const saveDate = await userData.save();
    res.status(201).send(saveDate);
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await userDetails.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send("Invalid User");
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    console.log(req.body.password);
    if (!validPassword) {
      return res.status(400).send("invalid Password");
    }
    const token = jwt.sign({ email: user.email }, "secretToken", {
      expiresIn: "1m",
    });

    res.status(200).json({ token, message: "Login successfully" });
  } catch (err) {
    console.log(err);
  }
});

app.post("/updatepassword", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await userDetails.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/email", async (req, res) => {
  try {
    const user = await userDetails.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send("Invalid User");
    }

    return res.status(200).send("User");
  } catch (err) {
    console.log(err);
  }
});

//send videos

app.post("/sendvideo", async (req, res) => {
  try {
    const video_url = await videoDetails.findOne({
      video_url: req.body.video_url,
    });
    if (video_url) {
      return res.status(400).send("already video is in  database");
    }
    const videoData = new videoDetails(req.body);
    const saveDate = await videoData.save();
    res.status(201).send(saveDate);
  } catch (err) {
    console.log(err);
  }
});

//get all video detials

app.get("/get-video-details", async (req, res) => {
  try {
    const videos = await videoDetails.find({});
    res.status(200).json(videos);
  } catch (error) {
    console.log(error);
  }
});

//user details

app.get("/get-user-details", async (req, res) => {
  try {
    const videos = await userDetails.find({});
    res.status(200).json(videos);
  } catch (error) {
    console.log(error);
  }
});

//single video

app.get("/individualvideo/:id", async (req, res) => {
  try {
    // const id = req.params.id;
    const { id } = req.params;
    const video = await videoDetails.findById({ _id: id });

    res.status(200).json(video);
  } catch (error) {
    console.log(error);
  }
});
//gaming individual videos
app.get("/individualvideoo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const video = await gamingDetails.findById({ _id: id });

    res.status(200).json(video);
  } catch (error) {
    console.log(error);
  }
});

//like videos

app.put("/updatelikevideo/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const video = await videoDetails.findById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const { liked } = req.query; // Extract the liked value from the request query

    if (liked === "true") {
      video.liked = true;
    } else if (liked === "false") {
      video.liked = false;
    } else {
      return res.status(400).json({ message: "Invalid liked value" });
    }

    await video.save();

    res.json({ message: "Video updated", video });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//update saved status

app.put("/videos/:id/save", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const { saved } = req.body;
  console.log(saved);
  try {
    const updatedVideo = await videoDetails.findByIdAndUpdate(
      id,
      { saved },
      { new: true }
    );
    if (!updatedVideo) {
      return res.status(404).json("video not found");
    }

    res.json(updatedVideo);
  } catch (error) {
    console.log(error);
  }
});

//get videos dy id

app.get("/get-video-by-query", async (req, res) => {
  const category = req.query.category;
  console.log(`Category: ${category}`);

  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  try {
    const videos = await videoDetails.find({ category: category });

    if (!videos || videos.length === 0) {
      console.log(`No videos found for category: ${category}`);
      return res.status(404).json({ message: "No videos found" });
    }

    res.json(videos);
  } catch (error) {
    console.error(`Error retrieving videos: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//gaming send videos

app.post("/gamingsendvideo", async (req, res) => {
  try {
    const video_url = await gamingDetails.findOne({
      video_url: req.body.video_url,
    });
    if (video_url) {
      return res.status(400).send("already video is in  database");
    }
    const videoData = new gamingDetails(req.body);
    const saveDate = await videoData.save();
    res.status(201).send(saveDate);
  } catch (err) {
    console.log(err);
  }
});
//get  gaming video
app.get("/get-gaming-video-details", async (req, res) => {
  try {
    const videos = await gamingDetails.find({});
    res.status(200).json(videos);
  } catch (error) {
    console.log(error);
  }
});

//getvideo by gamming quary

app.get("/get-video-by-queryy", async (req, res) => {
  const category = req.query.category;
  console.log(`Category: ${category}`);

  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  try {
    const videos = await gamingDetails.find({ category: category });

    if (!videos || videos.length === 0) {
      console.log(`No videos found for category: ${category}`);
      return res.status(404).json({ message: "No videos found" });
    }

    res.json(videos);
  } catch (error) {
    console.error(`Error retrieving videos: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//saved
app.get("/get-video-savedetail", async (req, res) => {
  const saved = req.query.saved;
  try {
    const videos = await videoDetails.find({ saved: saved });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// send img
app.post("/upload-image", async (req, res) => {
  const { user_id, base64 } = req.body;

  if (!user_id || !base64) {
    return res
      .status(400)
      .send({ Status: "error", data: "user_id and base64 are required" });
  }

  try {
    await imageDetails.create({ user_id, image: base64 });
    res.send({ Status: "ok" });
  } catch (error) {
    res.status(500).send({ Status: "error", data: error.message });
  }
});
//get img
app.get("/get-image/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const image = await imageDetails.findOne({
      user_id: decodeURIComponent(user_id),
    });
    if (image) {
      res.send({ status: "ok", data: image });
    } else {
      res.status(404).send({ status: "error", message: "Image not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", message: "Internal Server Error" });
  }
});

//update like videos of gamming
app.put("/updategamminglikevideo/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const video = await gamingDetails.findById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const { liked } = req.query; // Extract the liked value from the request query

    if (liked === "true") {
      video.liked = true;
    } else if (liked === "false") {
      video.liked = false;
    } else {
      return res.status(400).json({ message: "Invalid liked value" });
    }

    await video.save();

    res.json({ message: "Video updated", video });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//saved gamming vidos

app.put("/videoss/:id/save", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const { saved } = req.body;
  console.log(saved);
  try {
    const updatedVideo = await gamingDetails.findByIdAndUpdate(
      id,
      { saved },
      { new: true }
    );
    if (!updatedVideo) {
      return res.status(404).json("video not found");
    }

    res.json(updatedVideo);
  } catch (error) {
    console.log(error);
  }
});

//gaming saved ditial get
app.get("/get-video-savedetaill", async (req, res) => {
  const saved = req.query.saved;
  try {
    const videos = await gamingDetails.find({ saved: saved });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




app.get("/get-likegamingvideo-by-queryy", async (req, res) => {
  const liked = req.query.liked;
  console.log(`liked: ${liked}`);

  if (!liked) {
    return res.status(400).json({ message: "liked is required" });
  }

  try {
    const videos = await gamingDetails.find({ liked: liked });

    if (!videos || videos.length === 0) {
      console.log(`No videos found for category: ${liked}`);
      return res.status(404).json({ message: "No videos found" });
    }

    res.json(videos);
  } catch (error) {
    console.error(`Error retrieving videos: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get-likevideo-by-queryy", async (req, res) => {
  const liked = req.query.liked;
  console.log(`liked: ${liked}`);

  if (!liked) {
    return res.status(400).json({ message: "liked is required" });
  }

  try {
    const videos = await videoDetails.find({ liked: liked });

    if (!videos || videos.length === 0) {
      console.log(`No videos found for category: ${liked}`);
      return res.status(404).json({ message: "No videos found" });
    }

    res.json(videos);
  } catch (error) {
    console.error(`Error retrieving videos: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
