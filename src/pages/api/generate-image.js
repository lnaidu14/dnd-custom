import fs from "fs";
import path from "path";
import axios from "axios";
import { LocalImageGenerator } from '../../services/imageGenerator';

const imageGen = new LocalImageGenerator();

export default async function handler(req, res) {
  const { prompt } = req.query;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  // Generate a simple filename based on prompt
  const fileName = `${encodeURIComponent(prompt)}.png`;
  const filePath = path.join(process.cwd(), "public", "cache", fileName);

  // If cached image exists, return it
  if (fs.existsSync(filePath)) {
    return res.status(200).json({ url: `/cache/${fileName}` });
  }

  try {
    // Call local AI server (example: FastAPI on port 7860)
    const aiRes = await axios.get("http://127.0.0.1:7860/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const buffer = Buffer.from(await aiRes.arrayBuffer());

    // Save image to cache
    fs.writeFileSync(filePath, buffer);

    res.status(200).json({ url: `/cache/${fileName}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate image" });
  }
}
