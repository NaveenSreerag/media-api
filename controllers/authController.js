const User = require("../models/User");
const Post = require("../models/Post");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/jwtToken");
const cloudinary = require("cloudinary");

exports.register = async (req, res) => {
  try {
    const { email, fullname, password, gender, username } = req.body;
    if (!email || !password || !fullname || !username)
      return res.status(400).json({ msg: "Please enter all fields" });

    let newUsername = username.toLowerCase().replace(/ /g, "");

    let user_name = await User.findOne({ username: newUsername });
    if (user_name)
      return res.status(400).json({ msg: "This username already exists" });

    let user_email = await User.findOne({ email });
    if (user_email)
      return res.status(400).json({ msg: "This email already exists" });

    if (password.length < 8)
      return res
        .status(400)
        .json({ msg: "Password must be at least 8 Characters." });

    const user = await User.create({
      email,
      fullname,
      password,
      gender,
      username: newUsername,
    });

    sendToken(user, 201, res);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ msg: "Please enter email & password" });

  let user = await User.findOne({ email }).select("+password");

  if (!user) return res.status(404).json({ msg: "Invalid email or password" });

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return res.status(404).json({ msg: "Incorrect password" });
  } else {
    sendToken(user, 201, res);
  }
};

// Log out User

exports.logoutUser = async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  // res.clearCookie("token",{httpOnly:true,sameSite:'None',secure:true});

  return res.status(200).json({ success: true, message: "Logged Out Success" });
};

// get my profile
exports.getMyprofile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("posts following followers");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// get all user

exports.getallUsers = async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.query.username, $options: "i" },
    }).populate("posts");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// follow user

exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const LoggedUser = await User.findById(req.user._id);

    if (!userToFollow) {
      res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (LoggedUser.following.includes(userToFollow._id)) {
      const indexFollowing = LoggedUser.following.indexOf(userToFollow);
      const indexFollowers = userToFollow.followers.indexOf(LoggedUser);

      LoggedUser.following.splice(indexFollowing, 1);
      userToFollow.followers.splice(indexFollowers, 1);

      await LoggedUser.save();
      await userToFollow.save();

      res.status(200).json({
        success: true,
        msg: "Unfollowed",
      });
    } else {
      LoggedUser.following.push(userToFollow);
      userToFollow.followers.push(LoggedUser);

      await LoggedUser.save();
      await userToFollow.save();

      res.status(200).json({
        success: true,
        msg: "Followed",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: true,
      msg: error.message,
    });
  }
};

// update Password

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(404).json({
        success: false,
        msg: "Please Enter All Field!",
      });
    }

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Incorrect Old Password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Password Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    

    const data = {
       fullname: req.body.fullname,
       username: req.body.username,
       email: req.body.email,
       gender: req.body.gender,
       mobile: req.body.mobile,
       address: req.body.address,
       story: req.body.story,
       website: req.body.website,
       place: req.body.place,
    };
    

    if (data.username) {
      user.username = data.username.toLowerCase().replace(/ /g, "");
    }


 

   

    if (req.body.profilePicture !== "") {
      const imageId = user.profilePicture.public_id;
      if (imageId) {
        await cloudinary.uploader.destroy(imageId);
      }

      const newprofilePicture = await cloudinary.uploader.upload(
        req.body.profilePicture,
        {
          folder: "profilePicture",
          width: 1000,
          crop: "scale",
        }
      );

      data.profilePicture = {
        public_id: newprofilePicture.public_id,
        url: newprofilePicture.secure_url,
      };
    }

    if (req.body.coverPicture !== "") {
      const imageId = user.coverPicture.public_id;
      if (imageId) {
        await cloudinary.uploader.destroy(imageId);
      }

      const newcoverPicture = await cloudinary.uploader.upload(
        req.body.coverPicture,
        {
          folder: "coverPicture",
          width: 1000,
          crop: "scale",
        }
      );

      data.coverPicture = {
        public_id: newcoverPicture.public_id,
        url: newcoverPicture.secure_url,
      };
    }

    const profilePictureUpdate = await User.findByIdAndUpdate(user, data, {
      new: true,
    });

    res.status(200).json({
      success: true,
      profilePictureUpdate,
      msg: "Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.deleteMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = user.posts;
    const followers = user.followers;
    const followings = user.following;

    const userId = req.user._id;

    await user.remove();

    // after delete logout user
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    // delete posts of the user
    for (let i = 0; i < posts.length; i++) {
      const post = await Post.findById(posts[i]);
      await post.remove();
    }

    //  removing user from follower's followings

    for (let i = 0; i < followers.length; i++) {
      const follower = await User.findById(followers[i]);

      const index = follower.following.indexOf(userId);
      follower.following.splice(index, 1);
      await follower.save();
    }

    //  removing user from following's followers

    for (let i = 0; i < followings.length; i++) {
      const following = await User.findById(followings[i]);

      const index = following.followers.indexOf(userId);
      following.followers.splice(index, 1);
      await following.save();
    }

    res.status(200).json({
      success: true,
      msg: "Account Deleted",
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      msg: error.message,
    });
  }
};

// get user profile

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("posts following followers");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.getUserPost = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }
    const posts = [];

    for (let i = 0; i < user.posts.length; i++) {
      const post = await Post.findById(user.posts[i]).populate(
        "likes postedBy"
      ).populate({path:'comments',populate:{path:'user like'}});

      posts.push(post);
    }
    res.status(200).json({
      success: true,
      posts:posts.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
