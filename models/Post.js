const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    caption: String,

    image: 
      {
        public_id: String,
        url: String,
      },
    
    postedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
