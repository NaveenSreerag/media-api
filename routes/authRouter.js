const express = require("express");
const { register, loginUser, logoutUser, getMyprofile, followUser, getallUsers, updatePassword, updateProfile, deleteMyProfile, getUserProfile, getUserPost } = require("../controllers/authController");
const { isAuthenticatedUser } = require("../middleware/auth");
const router = express.Router()


router.route("/register").post(register);
router.route("/login").post(loginUser);
router.route("/me").get(isAuthenticatedUser,getMyprofile);
router.route("/users").get(isAuthenticatedUser,getallUsers);

router.route("/:id/follow").get(isAuthenticatedUser,followUser);
router.route("/update/password").post(isAuthenticatedUser,updatePassword);
router.route("/update/profile/me").put(isAuthenticatedUser,updateProfile);
router.route("/profile/delete/me").post(isAuthenticatedUser,deleteMyProfile);
router.route("/profile/user/:id").get(isAuthenticatedUser,getUserProfile);
router.route("/profile/user/:id/posts").get(isAuthenticatedUser,getUserPost);





router.route("/logout").get(isAuthenticatedUser,logoutUser);






module.exports = router