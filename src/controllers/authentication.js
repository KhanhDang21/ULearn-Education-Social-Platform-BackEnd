require("dotenv").config();

const jwt = require("jsonwebtoken");
const {
  signupSchema,
  signinSchema,
  changePasswordSchema,
  acceptFPCodeSchema,
} = require("../middlewares/validator");

const User = require("../models/users");
const UserInfo = require("../models/userInfo");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const transport = require("../middlewares/sendMail");

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = signupSchema.validate({ email, password });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exists!" });
    }

    const hashedPassword = await doHash(password, 12);

    const newUser = new User({
      email,
      password: hashedPassword,
    });
    const result = await newUser.save();
    result.password = undefined;
    res.status(201).json({
      success: true,
      message: "Your account has been created successfully",
      result,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = signinSchema.validate({ email, password });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist!" });
    }

    const isValid = await doHashValidation(password, existingUser.password);
    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials!" });
    }

    // Pull userInfoId (and any other fields) into local vars
    const {
      _id: userId,
      userInfoId,
      email: userEmail,
      verified,
    } = existingUser;

    // Sign the token
    const token = jwt.sign(
      { userId, userInfoId, email: userEmail, verified },
      process.env.TOKEN_SECRET,
      { expiresIn: "8h" }
    );

    // Set the cookie and return all the fields you need
    res
      .cookie("Authorization", "Bearer " + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        success: true,
        token,
        userId, // optional: if you want to send it
        userInfoId, // ← here’s your userInfoId
        email: userEmail,
        verified,
        message: "Logged in successfully",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.signout = async (req, res) => {
  res
    .clearCookie("Authorization")
    .status(200)
    .json({ success: true, message: "logged out successfully" });
};

exports.changePassword = async (req, res) => {
  const { userId, verified } = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
    const { error, value } = changePasswordSchema.validate({
      oldPassword,
      newPassword,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "You are not verified user!" });
    }
    const existingUser = await User.findOne({ _id: userId }).select(
      "+password"
    );
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exists!" });
    }
    const result = await doHashValidation(oldPassword, existingUser.password);
    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials!" });
    }
    const hashedPassword = await doHash(newPassword, 12);
    existingUser.password = hashedPassword;
    await existingUser.save();
    return res
      .status(200)
      .json({ success: true, message: "Password updated!!" });
  } catch (error) {
    console.log(error);
  }
};

exports.sendForgotPasswordCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exists!" });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();
    let info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: "Forgot password code",
      html: "<h1>" + codeValue + "</h1>",
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.forgotPasswordCode = hashedCodeValue;
      existingUser.forgotPasswordCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({ success: true, message: "Code sent!" });
    }
    res.status(400).json({ success: false, message: "Code sent failed!" });
  } catch (error) {
    console.log(error);
  }
};

exports.verifyForgotPasswordCode = async (req, res) => {
  const { email, providedCode, newPassword } = req.body;
  try {
    const { error, value } = acceptFPCodeSchema.validate({
      email,
      providedCode,
      newPassword,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      "+forgotPasswordCode +forgotPasswordCodeValidation"
    );

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exists!" });
    }

    if (
      !existingUser.forgotPasswordCode ||
      !existingUser.forgotPasswordCodeValidation
    ) {
      return res
        .status(400)
        .json({ success: false, message: "something is wrong with the code!" });
    }

    if (
      Date.now() - existingUser.forgotPasswordCodeValidation >
      5 * 60 * 1000
    ) {
      return res
        .status(400)
        .json({ success: false, message: "code has been expired!" });
    }

    const hashedCodeValue = hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if (hashedCodeValue === existingUser.forgotPasswordCode) {
      const hashedPassword = await doHash(newPassword, 12);
      existingUser.password = hashedPassword;
      existingUser.forgotPasswordCode = undefined;
      existingUser.forgotPasswordCodeValidation = undefined;
      await existingUser.save();
      return res
        .status(200)
        .json({ success: true, message: "Password updated!!" });
    }
    return res
      .status(400)
      .json({ success: false, message: "unexpected occured!!" });
  } catch (error) {
    console.log(error);
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    const email = await User.findOne({ email: req.user.email });
    const userInfo = await UserInfo.findById(req.user.userInfoId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user, email, userInfo });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
