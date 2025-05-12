const Post = require("../models/post");
const multer = require("multer");
const { authenticateJWT } = require("../middlewares/auth");
const Image = require("../models/image");
const mongoose = require("mongoose");

const upload = multer();
exports.addPost = [
  authenticateJWT, // Bắt buộc phải login, middleware sẽ set req.user.userId
  upload.single("image"), // Đọc file form-data key='image'
  async (req, res) => {
    const userId = req.user.userId; // lấy từ token
    const content = req.body.content?.trim();

    if (!content && !req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Content or image required" });
    }

    try {
      // 1) Nếu có ảnh, lưu vào collection Image
      let imageId = null;
      if (req.file) {
        const newImage = new Image({
          data: req.file.buffer,
          contentType: req.file.mimetype,
        });
        await newImage.save();
        imageId = newImage._id;
      }

      // 2) Tạo Post mới
      const newPost = new Post({
        userId,
        content,
        imageId, // có thể null nếu không upload ảnh
        comments: [], // khởi mặc định
      });
      await newPost.save();

      // 3) Trả về
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
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send("Not found");
    }

    res.json({
      message: "Get userInfo successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error");
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
