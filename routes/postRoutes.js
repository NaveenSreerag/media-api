const express = require("express");
const { createPost, deletePost, getFollowingPosts, updatePostCaption, likeAndUnlikePost } = require("../controllers/postController");
const { isAuthenticatedUser } = require("../middleware/auth");
const router = express.Router();

router.route("/post/create").post(isAuthenticatedUser,createPost)
router.route("/post/delete/:id").delete(isAuthenticatedUser,deletePost)

router.route("/post/likeandunlike/:id").get(isAuthenticatedUser,likeAndUnlikePost)

router.route("/post/all").get(isAuthenticatedUser,getFollowingPosts);
router.route("/post/update/:id").put(isAuthenticatedUser,updatePostCaption);







module.exports = router;