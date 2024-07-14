import { NextResponse } from "next/server"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"

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
async function deleteFileFromS3(fileName) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
  }

  const command = new DeleteObjectCommand(params)

  await s3Client.send(command)
  return { message: "File deleted successfully" }
}

export async function DELETE(request) {
  const url = new URL(request.url)
  const fileName = url.searchParams.get("fileName")

  try {
    if (!fileName) {
      return NextResponse.json(
        { error: "File name is required." },
        { status: 400 },
      )
    }

    await deleteFileFromS3(fileName)

    return NextResponse.json({ message: "File deleted successfully." })
  } catch (error) {
    return NextResponse.json({ error })
  }
}
