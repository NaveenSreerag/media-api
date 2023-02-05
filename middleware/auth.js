const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.isAuthenticatedUser = async (req, res, next) => {
 try {
  
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .json({ msg: "Please login " });
  }

  const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_JWT_SECRET);

  req.user = await User.findById(decodedData.id);

  next();

 } catch (error) {
  
  res.status(501).json({msg:error.message})
 }
};


