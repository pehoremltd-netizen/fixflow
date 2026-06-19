import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { bucket, file_name, content_type, file_base64 } = req.body;
  if (!bucket || !file_name || !file_base64) {
    res.status(400).json({ error: "bucket, file_name, and file_base64 are required" });
    return;
  }

  const buffer = Buffer.from(file_base64, "base64");
  const { data, error } = await supabase.storage.from(bucket).upload(file_name, buffer, {
    contentType: content_type || "application/octet-stream",
    upsert: true,
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  res.status(201).json({ url: urlData.publicUrl });
});

export default router;
