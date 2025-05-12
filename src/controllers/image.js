const Image = require("../models/image");

exports.postImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please choose picture" });
    }

    const newImage = new Image({
      data: req.file.buffer,
      contentType: req.file.mimetype,
    });

    await newImage.save();

    res.status(201).json({
      message: "Image saved",
      imageId: newImage._id,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image || !image.data) {
      return res.status(404).send("Not found");
    }

    res.set("Content-Type", image.contentType);
    return res.send(image.data);
    // res.json({
    //     message: "Get image successfully",
    //     contentType: image.contentType
    // })
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error");
  }
};

exports.updateImage = async (req, res) => {
  const imageId = req.params.id;

  try {
    // 1. Kiểm tra có file upload
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Please choose image" });
    }

    // 2. Cập nhật buffer và contentType
    const updatedImage = await Image.findByIdAndUpdate(
      imageId,
      {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
      { new: true }
    );
    if (!updatedImage) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    // 3. Trả về ID mới (thường giống ID cũ)
    return res.json({
      success: true,
      message: "Update image successfully",
      imageId: updatedImage._id,
    });
  } catch (error) {
    console.error("Error in updateImage:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const deletedImage = Image.findByIdAndDelete(req.params.id);

    if (!deletedImage) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    res.json({
      message: "Deleted image successfully",
      deletedImageId: deletedImage._id,
    });
  } catch (error) {
    console.error("Error:", error);
  }
};
