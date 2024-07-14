import { NextResponse } from "next/server"
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import toast from "react-hot-toast"

let s3Client
if (process.env.NEXT_PUBLIC_ENVIRONMENT !== "dev") {
  s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
  })
} else {
  s3Client = null
}
async function generateSignedUrl(fileName) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Expires: 3600,
  }
  const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand(params), {
    expiresIn: 3600,
  })
  return signedUrl
}

async function uploadFileToS3(file, fileName) {
  const fileBuffer = file
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${fileName}`,
    Body: fileBuffer,
    ContentType: "application/octet-stream",
  }

  const command = new PutObjectCommand(params)
  try {
    await s3Client.send(command)
    const signedUrl = await generateSignedUrl(fileName)
    return { fileName, signedUrl }
  } catch (error) {
    toast.error("Upload Error:", error)
    throw error
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "File is required." }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name

    const { signedUrl } = await uploadFileToS3(buffer, fileName)

    return NextResponse.json(signedUrl)
  } catch (error) {
    return NextResponse.json({ error })
  }
}
