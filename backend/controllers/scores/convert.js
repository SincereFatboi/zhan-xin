import CloudConvert from "cloudconvert";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);
const prisma = new PrismaClient();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Call this after your frontend finished uploading the PDF to S3
export const convert = async (req, res) => {
  try {
    let { Key } = req.body;

    if (!Key || Key.split(".").pop() === undefined) {
      return res.status(400).json({ message: "Key is required" });
    }

    Key = decodeURIComponent(Key);

    const ext = Key.split(".").pop()?.toLowerCase();

    let job;

    if (ext === "pdf") {
      job = await cloudConvert.jobs.create({
        tasks: {
          "import-from-s3": {
            operation: "import/s3",
            bucket: process.env.AWS_BUCKET,
            region: process.env.AWS_REGION,
            key: Key,
            access_key_id: process.env.AWS_ACCESS_KEY_ID,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
          },
          "convert-to-html": {
            operation: "convert",
            input: "import-from-s3",
            input_format: "pdf",
            output_format: "html",
            engine: "pdf2htmlex",
            zoom: 1.2,
            embed_javascript: true,
            embed_fonts: true,
            bg_format: "png",
            outline: false,
            embed_css: true,
            embed_images: true,
            split_pages: false,
          },
          "export-to-s3": {
            operation: "export/s3",
            input: "convert-to-html",
            bucket: process.env.AWS_BUCKET,
            region: process.env.AWS_REGION,
            access_key_id: process.env.AWS_ACCESS_KEY_ID,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
            // key_prefix: outPrefix,
          },
        },
      });
    } else if (ext === "docx") {
      job = await cloudConvert.jobs.create({
        tasks: {
          "import-from-s3": {
            operation: "import/s3",
            bucket: process.env.AWS_BUCKET,
            region: process.env.AWS_REGION,
            key: Key,
            access_key_id: process.env.AWS_ACCESS_KEY_ID,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
          },
          "convert-to-pdf": {
            operation: "convert",
            input: "import-from-s3",
            input_format: "docx",
            output_format: "pdf",
            engine: "office",
          },
          "convert-to-html": {
            operation: "convert",
            input: "convert-to-pdf",
            input_format: "pdf",
            output_format: "html",
            engine: "pdf2htmlex",
            zoom: 1.2,
            embed_javascript: true,
            embed_fonts: true,
            bg_format: "png",
            outline: false,
            embed_css: true,
            embed_images: true,
            split_pages: false,
          },
          "export-to-s3": {
            operation: "export/s3",
            input: "convert-to-html",
            bucket: process.env.AWS_BUCKET,
            region: process.env.AWS_REGION,
            access_key_id: process.env.AWS_ACCESS_KEY_ID,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
            // key_prefix: outPrefix,
          },
        },
      });
    } else if (ext === "docm") {
      job = await cloudConvert.jobs.create({
        tasks: {
          "import-from-s3": {
            operation: "import/s3",
            bucket: process.env.AWS_BUCKET,
            region: process.env.AWS_REGION,
            key: Key,
            access_key_id: process.env.AWS_ACCESS_KEY_ID,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
          },
          "convert-to-pdf": {
            operation: "convert",
            input: "import-from-s3",
            input_format: "docm",
            output_format: "pdf",
            engine: "office",
          },
          "convert-to-html": {
            operation: "convert",
            input: "convert-to-pdf",
            input_format: "pdf",
            output_format: "html",
            engine: "pdf2htmlex",
            zoom: 1.2,
            embed_javascript: true,
            embed_fonts: true,
            bg_format: "png",
            outline: false,
            embed_css: true,
            embed_images: true,
            split_pages: false,
          },
          "export-to-s3": {
            operation: "export/s3",
            input: "convert-to-html",
            bucket: process.env.AWS_BUCKET,
            region: process.env.AWS_REGION,
            access_key_id: process.env.AWS_ACCESS_KEY_ID,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
            // key_prefix: outPrefix,
          },
        },
      });
    } else if (ext === "doc") {
      job = await cloudConvert.jobs.create({
        tasks: {
          "import-from-s3": {
            operation: "import/s3",
            bucket: process.env.AWS_BUCKET,
            region: process.env.AWS_REGION,
            key: Key,
            access_key_id: process.env.AWS_ACCESS_KEY_ID,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
          },
          "convert-to-pdf": {
            operation: "convert",
            input: "import-from-s3",
            input_format: "doc",
            output_format: "pdf",
            engine: "office",
          },
          "convert-to-html": {
            operation: "convert",
            input: "convert-to-pdf",
            input_format: "pdf",
            output_format: "html",
            engine: "pdf2htmlex",
            zoom: 1.2,
            embed_javascript: true,
            embed_fonts: true,
            bg_format: "png",
            outline: false,
            embed_css: true,
            embed_images: true,
            split_pages: false,
          },
          "export-to-s3": {
            operation: "export/s3",
            input: "convert-to-html",
            bucket: process.env.AWS_BUCKET,
            region: process.env.AWS_REGION,
            access_key_id: process.env.AWS_ACCESS_KEY_ID,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
            // key_prefix: outPrefix,
          },
        },
      });
    } else if (ext === "html") {
      job = await cloudConvert.jobs.create({
        tasks: {
          "import-from-s3": {
            operation: "import/s3",
            bucket: process.env.AWS_BUCKET,
            region: process.env.AWS_REGION,
            key: Key,
            access_key_id: process.env.AWS_ACCESS_KEY_ID,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
          },
          "convert-to-pdf": {
            operation: "convert",
            input: "import-from-s3",
            input_format: "html",
            output_format: "pdf",
            engine: "chrome",
          },
          "convert-to-html": {
            operation: "convert",
            input: "convert-to-pdf",
            input_format: "pdf",
            output_format: "html",
            engine: "pdf2htmlex",
            zoom: 1.2,
            embed_javascript: true,
            embed_fonts: true,
            bg_format: "png",
            outline: false,
            embed_css: true,
            embed_images: true,
            split_pages: false,
          },
          "export-to-s3": {
            operation: "export/s3",
            input: "convert-to-html",
            bucket: process.env.AWS_BUCKET,
            region: process.env.AWS_REGION,
            access_key_id: process.env.AWS_ACCESS_KEY_ID,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
          },
        },
      });
    } else {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    const completed = await cloudConvert.jobs.wait(job.id);
    const exportTask = completed.tasks.find((t) => t.name === "export-to-s3");

    const newKey =
      exportTask?.result?.files?.[0]?.filename ||
      Key.replace(/\.[^./]+$/, ".html");

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key,
        }),
      );
      await prisma.score.update({
        where: { scoreName: Key },
        data: { scoreName: newKey },
      });

      return res.json({
        jobID: completed?.id,
        exportResult: exportTask?.result,
        newKey,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to update original file in S3 bucket" });
    }
  } catch (err) {
    console.error("Score conversion failed:", err);
    return res.status(500).json({ message: "Score conversion failed" });
  }
};
