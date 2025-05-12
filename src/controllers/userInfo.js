const UserInfo = require("../models/userInfo");
const User = require("../models/users");

exports.postUserInfo = async (req, res) => {
  // 1. Lấy userId từ req.user (middleware authenticateJWT phải gán)
  const userId = req.user?.userId;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: no user ID" });
  }

  const { name, bio, university, imageId } = req.body;

  try {
    // 2. Tạo mới UserInfo và lưu
    const newUserInfo = new UserInfo({
      userId, // nếu bạn muốn giữ reference trong UserInfo
      name,
      bio,
      university,
      imageId,
    });
    await newUserInfo.save();

    // 3. Cập nhật trường userInfoId trên User
    const updatedUser = await User.findByIdAndUpdate(
      userId, // ↖ Đây là ID, không phải object filter
      { userInfoId: newUserInfo._id }, // ↖ Đây là object update
      { new: true, select: "-password" } // ↖ Trả về document mới, exclude password
    );
    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 4. Trả về thành công
    return res.status(201).json({
      success: true,
      message: "UserInfo saved",
      data: newUserInfo,
    });
  } catch (error) {
    console.error("Error in postUserInfo:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const userInfor = await UserInfo.findById(req.params.id);

    if (!userInfor) {
      return res.status(404).send("Not found");
    }

    res.json({
      message: "Get userInfo successfully",
      data: userInfor,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error");
  }
};

exports.updateUserInfo = async (req, res) => {
  // 1) Lấy đúng các field từ body
  const { name, bio, university, imageId } = req.body;
  const id = req.params.id;

  try {
    // 2) Tìm document đã có và cập nhật
    const updated = await UserInfo.findByIdAndUpdate(
      id,
      { name, bio, university, imageId },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "UserInfo not found" });
    }

    // 3) Trả về object đã cập nhật
    return res.json({
      success: true,
      message: "UserInfo updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error in updateUserInfo:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteUserInfo = async (req, res) => {
  try {
    const UserInfo = UserInfo.findByIdAndDelete(req.params.id);

    if (!UserInfo) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    res.json({
      message: "Deleted UserInfo successfully",
    });
  } catch (error) {
    console.error("Error:", error);
  }
};
