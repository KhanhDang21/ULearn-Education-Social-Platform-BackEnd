const Post = require("../models/post");
const multer = require("multer");
const { authenticateJWT } = require("../middlewares/auth");
const Image = require("../models/image");
const mongoose = require("mongoose");

const upload = multer();
exports.addPost = [
  authenticateJWT,
  async (req, res) => {
    const userId = req.user.userId;
    const content = req.body.content?.trim();
    const imageId = req.body.imageId ?? null;

    if (!content && !imageId) {
      return res
        .status(400)
        .json({ success: false, message: "Content or image required" });
    }

    try {
      const newPost = new Post({
        userId,
        content,
        imageId,
        comments: [],
        status: true, // if you need it
      });
      await newPost.save();

      return res.status(201).json({
        success: true,
        message: "Post saved",
        data: newPost,
      });
    } catch (error) {
      console.error("Error in addPost:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
];

exports.getPost = async (req, res) => {
  try {
    const id = req.params.id;
    // Find posts where either userInfoId or userId matches the provided id
    const posts = await Post.find({
      $or: [{ userInfoId: id }, { userId: id }],
    });

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user" });
    }

    res.json({
      message: "Posts retrieved successfully",
      data: posts,
    });
  } catch (error) {
    console.error("Error in getPost:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const updatedPost = Post.findByIdAndUpdate(
      req.params.id,
      {
        imageId: req.body,
        content: req.body,
      },
      {
        new: true,
      }
    );

    if (!updatedPost) {
      return res.status(404).send("Not found");
    }

    res.json({
      message: "Update post successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    res.json({
      message: "Deleted post successfully",
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      // 1) Sort posts mới nhất trước
      { $sort: { createdAt: -1 } },

      // 2) Join vào collection users để lấy thông tin cơ bản
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // 3) Join vào collection userinfos để lấy name + avatar
      {
        $lookup: {
          from: "userinfos",
          localField: "userId",
          foreignField: "userId",
          as: "userInfo",
        },
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 4) Join vào collection comments để nhúng toàn bộ mảng comment objects
      {
        $lookup: {
          from: "comments",
          localField: "_id", // _id của post
          foreignField: "postId", // postId trong comment
          as: "comments",
        },
      },

      // 5) Chọn ra những trường cần thiết
      {
        $project: {
          _id: 1,
          content: 1,
          imageId: 1,
          createdAt: 1,
          "user._id": 1,
          "user.email": 1,
          "userInfo.name": 1,
          "userInfo.imageId": 1,
          comments: 1, // mảng comment đầy đủ
        },
      },
    ]);

    return res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Error in getAllPosts:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
