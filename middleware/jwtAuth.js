const jwt = require("jsonwebtoken");

const middleWare = function (req, res, next) {
  //get the token from header or query string
  let token = req.headers["Authorization"];

  if (!token) {
    return res.status(403).send({ auth: false, message: "No token provided" });
  }
  try {
    //verify the token
    const decoded = jwt.verify(token, "secretkey");
    req.user = decoded;
  } catch (err) {
    console.log("error", err);
  }
};
module.exports = middleWare;
