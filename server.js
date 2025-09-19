// server.js
const express = require("express");
const fetch = require("node-fetch");
const FormData = require("form-data");
const path = require("path");

const app = express();
const PORT = 3000;
const CATBOX_API = "https://catbox.moe/user/api.php";

app.get("/upload", async (req, res) => {
  let { url } = req.query;

  if (!url) {
    return res.status(400).json({
      author: "minatocodes",
      success: false,
      error: "Missing 'url' query parameter"
    });
  }

  try {
    // ✅ Only strip trailing dl=1 if present
    url = url.replace(/(\?|&)dl=1$/, "");

    // Download file with spoofed headers
    const fileRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*"
      }
    });

    if (!fileRes.ok) throw new Error(`Failed to fetch file: ${fileRes.status} ${fileRes.statusText}`);

    const buffer = await fileRes.buffer();

    // Try to detect extension from URL or Content-Type
    let filename = "upload";
    const contentType = fileRes.headers.get("content-type") || "";

    if (url.includes(".")) {
      filename += path.extname(url.split("?")[0]);
    } else if (contentType.includes("image/jpeg")) {
      filename += ".jpg";
    } else if (contentType.includes("image/png")) {
      filename += ".png";
    } else if (contentType.includes("video/mp4")) {
      filename += ".mp4";
    } else {
      filename += ".bin"; // fallback
    }

    // Build form for Catbox upload
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", buffer, {
      filename,
      contentType: contentType || "application/octet-stream"
    });

    // Upload to Catbox
    const uploadRes = await fetch(CATBOX_API, {
      method: "POST",
      body: formData
    });

    const text = await uploadRes.text();

    if (uploadRes.ok && text.startsWith("http")) {
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
