const Group = require("../models/group");
const Post = require("../models/post");
const UserInfo = require("../models/userInfo");
const mongoose = require("mongoose");

exports.addGroup = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    console.log("token missing or invalid");
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: no used ID" });
  }
  const { name, description, imageId } = req.body;
  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "Group name is required" });
  }
  try {
    const newGroup = await Group.create({
      name,
      description,
      imageId,
      admins: [userId],
      members: [userId],
    });

    res.status(201).json({
      success: true,
      message: "Group saved",
      data: newGroup,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("admins", "email")
      .populate("members", "email");

    res.json(groups);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    if (!group.members.includes(req.user.userId)) {
      group.members.push(req.user.userId);
      await group.save();
    }

    res.json({
      message: "Joined group",
      group,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    group.members = group.members.filter(
      (member) => member.toString() !== req.user.userId
    );
    await group.save();

    res.json({
      message: "Left group",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.addPost = async (req, res) => {
  try {
    const { content, imageId } = req.body;
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(req.user.userId)) {
      return res
        .status(403)
        .json({ message: "You must be a group member to post" });
    }

    const post = await Post.create({
      userId: req.user.userId,
      groupId: groupId,
      content,
      imageId,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteGroup = async (req, res) => {
  await Group.findByIdAndDelete(req.params.id);
  res.json({ message: "Group deleted" });
};

exports.getAllGroups = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Chuyển sang ObjectId để so sánh trong pipeline
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const groups = await Group.aggregate([
      // 1. Sort nhóm mới nhất trước
      { $sort: { createdAt: -1 } },

      // 2. Thêm URL cho banner và logo
      {
        $addFields: {
          bannerUrl: {
            $cond: [
              { $ifNull: ["$imageId", false] },
              { $concat: ["/api/image/get-image/", "$imageId"] },
              null,
            ],
          },
          logoUrl: {
            $cond: [
              { $ifNull: ["$imageId", false] },
              { $concat: ["/api/image/get-image/", "$imageId"] },
              null,
            ],
          },
          ppd: 0,
        },
      },

      // 3. Lookup thông tin thành viên từ userinfos
      {
        $lookup: {
          from: "userinfos", // collection lưu profile người dùng
          localField: "members", // mảng ObjectId ở Group.members
          foreignField: "userId", // trường link ở userinfos
          as: "memberInfos",
        },
      },

      // 4. Lookup thông tin admins (trong đó admins[0] là creator)
      {
        $lookup: {
          from: "userinfos",
          localField: "admins",
          foreignField: "userId",
          as: "adminInfos",
        },
      },

      // 5. Project ra đúng shape cần thiết
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          bannerUrl: 1,
          logoUrl: 1,

          // Tổng số thành viên
          memberCount: { $size: "$members" },

          // Lấy tối đa 5 avatar thành viên
          members: {
            $slice: [
              {
                $map: {
                  input: "$memberInfos",
                  as: "mi",
                  in: {
                    _id: "$$mi.userId",
                    name: "$$mi.name",
                    avatarUrl: {
                      $concat: ["/api/image/get-image/", "$$mi.imageId"],
                    },
                  },
                },
              },
              5,
            ],
          },

          // Map toàn bộ admins (creator + admin khác nếu có)
          admins: {
            $map: {
              input: "$adminInfos",
              as: "ai",
              in: {
                _id: "$$ai.userId",
                name: "$$ai.name",
                avatarUrl: {
                  $concat: ["/api/image/get-image/", "$$ai.imageId"],
                },
              },
            },
          },

          // Đặt type dựa trên status boolean
          type: {
            $cond: [{ $eq: ["$status", true] }, "Public", "Private"],
          },

          // Kiểm tra xem user hiện tại có trong members không
          isJoin: { $in: [userObjectId, "$members"] },
        },
      },
    ]);

    return res.status(200).json({ success: true, data: groups });
  } catch (err) {
    console.error("Error in getAllGroups:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
