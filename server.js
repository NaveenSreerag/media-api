require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
const fileupload = require('express-fileupload'); 

const app = express();





cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(bodyParser.json({limit:"50mb",extended:true}));
app.use(bodyParser.urlencoded({limit:"50mb",extended:true}));
app.use(fileupload());

app.use((req,res,next) =>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST, GET, PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  next();
})
app.use(cors());
app.use(cookieParser());



const URI = process.env.MONGO_DB_URL;
mongoose.connect(URI, (err) => {
  if (err) throw err;

  console.log("Database connected");
});

const userRoute = require("./routes/authRouter");
const postRoute = require("./routes/postRoutes");
const commentRoute = require("./routes/commentRouter");

app.use("/api/v1/", userRoute);
app.use("/api/v1/", postRoute);
app.use("/api/v1/", commentRoute);

const port = 5000;

app.listen(port, () => {
  console.log("server running on port", port);
});
