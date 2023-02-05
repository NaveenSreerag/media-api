const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("cloudinary")

exports.createPost = async (req, res) => {
  try {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "Posts",
    });
    newPostData = {
      caption: req.body.caption,
      image: 
        {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      
      postedBy: req.user._id,
    };

    const post = await Post.create(newPostData);

    const user = await User.findById(req.user._id);

    user.posts.push(post._id);
    await user.save();

    res.status(201).json({
      success: true,
      post:post.reverse()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// like post
exports.likeAndUnlikePost = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);

    if(!post){

      return res.status(404).json({
        success:false,
        msg:"Post not found"
      })
    }

    if(post.likes.includes(req.user._id)){

      const index = post.likes.indexOf(req.user._id);

      post.likes.splice(index,1)

      await post.save()

      return res.status(200).json({success:true,
        msg:"post unliked"})
    }else{

      post.likes.push(req.user._id)

      await post.save();
       
      return res.status(200).json({
        success:true,
        msg:"post Liked"
      })
    }

   

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};




// delete post 


exports.deletePost = async (req,res)=>{

    try {
        
        const post = await Post.findById(req.params.id);

        if(!post){
            res.status(404).json({
                success:false,
                msg:"Not Found"
            })
        }

        if(post.postedBy.toString() !== req.user._id.toString() ){
           return res.status(401).json({
                success:false,
                msg:"Unauthorised"
            })
        }

        await post.remove();

        const user = await User.findById(req.user._id);

        const index= user.posts.indexOf(req.params.id)

        user.posts.splice(index,1)

        await user.save();

        res.status(200).json({
            success:true,
            msg:"Post Deleted"
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            msg:error.message
        })
    }
}

// get all following posts

exports.getFollowingPosts = async(req,res)=>{

  try {
const currentUser = req.user._id
    const user = await User.findById(req.user._id);

    const posts = await Post.find({
      postedBy:{
        $in:[...user.following,currentUser]
      }
    }).populate("postedBy likes").populate({path:'comments',populate:{path:'user like'}})

    res.status(200).json({
      success:true,
      posts:posts.reverse()
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      msg:error.message
    })
  }
}

exports.updatePostCaption = async(req,res)=>{

  try {
    

    const post = await Post.findById(req.params.id);

    if(!post){
     return res.status(404).json({
        success:false,
        msg:"Post not found"
      })


    }

    if(post.postedBy.toString() !== req.user._id.toString()){
     return res.status(404).json({
        success:false,
        msg:"Unauthorised"
      })
    }

    post.caption = req.body.caption

    await post.save();

    res.status(200).json({
      success:false,
      msg:"Post Updated"
    })
  } catch (error) {
    
    res.status(500).json({
      success:false,
      msg:error.message
    })
  }
}

