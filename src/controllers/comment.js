const Comment = require("../models/comment");
const Post = require("../models/post");

exports.postComment = async (req, res) => {
  const { postId, content } = req.body;
  const userId = req.userId || (req.user && req.user.userId);
  try {
    const newComment = new Comment({
      userId,
      postId,
      content,
    });

    await newComment.save();

    await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment._id } },
      { new: true }
    );

    res.status(201).json({
      message: "Comment saved",
      data: newComment,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getComment = async (req, res) => {
  try {
    // ❶ Thêm await ở đây
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // ❷ Trả về đúng dữ liệu
    return res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("Error in getComment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const updatedComment = Comment.findByIdAndUpdate(
      req.params.id,
      {
        userId: req.user.userId,
        postId: req.body,
        content: req.body,
      },
      {
        new: true,
      }
    );

    if (!updatedComment) {
      return res.status(404).send("Not found");
    }

    res.json({
      message: "Update comment successfully",
      data: updatedComment,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = Comment.findByIdAndDelete(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    res.json({
      message: "Deleted comment successfully",
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

exports.getAllComments = async (req, res) => {
  try {
    // Nếu có param postId thì chỉ lấy comment của bài đó
    const filter = req.params.postId ? { postId: req.params.postId } : {};

    const comments = await Comment.find(filter).sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      data: comments,
    });
  } catch (err) {
    console.error("Error in getAllComments:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
