const Comment = require('../models/Comment')
const Post = require('../models/Post')


exports.createComment = async(req,res)=>{

    try {

        const post = await Post.findById(req.params.id)

        if(!post)return res.status(404).json({msg: 'No post found'});
      
        
        const {comment,tag,reply} = req.body;

        const newComment = new Comment({
            user: req.user,
            comment,
            tag,
            reply,
            
        })

       await Post.findByIdAndUpdate(post,{
        $push:{comments:newComment}
       },{new:true})
      
        await newComment.save()
        res.status(200).json({
            msg: 'Comment created successfully',
            newComment
        })

    } catch (error) {
        res.status(500).json({
            msg: error.message
        })
    }
}

exports.updateComment = async(req,res)=>{

    try {

       
        const comment = await Comment.findById(req.params.id)


        if(comment.user._id.toString()!== req.user._id.toString()){
            return res.status(401).json({
                msg: 'You are not authorized to update this comment'
            })
        }

        comment.comment = req.body.comment

        await comment.save()
        res.status(200).json({
            msg: 'Comment updated successfully',
            comment})

    } catch (error) {
        
        res.status(500).json({
            msg: error.message
        })
    }
}