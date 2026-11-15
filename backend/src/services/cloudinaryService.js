const crypto = require("crypto");
const https = require("https");

/**
 * Uploads an image to Cloudinary using signed REST API.
 * If Cloudinary credentials are not provided in environment, returns fallback URL.
 */
async function uploadImage(fileData, folder = "richu") {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    // Graceful fallback for local development or when credentials are not configured
    if (typeof fileData === "string" && (fileData.startsWith("http://") || fileData.startsWith("https://"))) {
      return fileData;
    }
    // Return sample garment placeholder if base64 provided without credentials
    return "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80";
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

  const boundary = `----RichuCloudinaryBoundary${Date.now()}`;
  let postData = "";

  const fields = {
    file: fileData,
    api_key: apiKey,
    timestamp: timestamp.toString(),
    folder: folder,
    signature: signature
  };

  for (const [key, value] of Object.entries(fields)) {
    postData += `--${boundary}\r\n`;
    postData += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    postData += `${value}\r\n`;
  }
  postData += `--${boundary}--\r\n`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.cloudinary.com",
      port: 443,
      path: `/v1_1/${cloudName}/image/upload`,
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed.secure_url || parsed.url);
          } else {
            reject(new Error(parsed.error?.message || "Cloudinary upload failed"));
          }
        } catch (err) {
          reject(new Error("Invalid response from Cloudinary"));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

module.exports = { uploadImage };
