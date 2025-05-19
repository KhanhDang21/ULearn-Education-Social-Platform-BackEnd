const axios = require("axios");

async function generateText(prompt) {
  try {
    const response = await axios.post("http://127.0.0.1:8000/generate", {
      prompt,
    });
    return response.data.result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = { generateText };
