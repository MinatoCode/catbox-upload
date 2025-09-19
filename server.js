// server.js
const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;
const CATBOX_API = "https://catbox.moe/user/api.php";

app.get("/upload", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      author: "minatocodes",
      success: false,
      error: "Missing 'url' query parameter"
    });
  }

  try {
    const formData = new URLSearchParams();
    formData.append("reqtype", "urlupload");
    formData.append("url", url);

    const response = await fetch(CATBOX_API, {
      method: "POST",
      body: formData
    });

    const text = await response.text();

    if (response.ok && text.startsWith("http")) {
      res.json({
        author: "minatocodes",
        success: true,
        hostedurl: text.trim()
      });
    } else {
      res.json({
        author: "minatocodes",
        success: false,
        error: text
      });
    }
  } catch (err) {
    res.json({
      author: "minatocodes",
      success: false,
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
    
