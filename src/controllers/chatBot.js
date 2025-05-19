const { generateText } = require("../middlewares/callAPIChatbot");

exports.chatBot = async (req, res) => {
  const { message } = req.body;
  const reply = await generateText(message);
  if (reply) {
    res.json({ reply });
  } else {
    res.status(500).json({ error: "GPT-2 service error" });
  }
};
