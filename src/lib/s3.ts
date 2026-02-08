import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import configs from "../config/env";

const s3Client = new S3Client({
  region: configs.awsRegion,
  credentials: {
    accessKeyId: configs.awsAccessKeyId,
    secretAccessKey: configs.awsSecretAccessKey,
  },
});

export const uploadFileToS3 = async (
  file: Express.Multer.File,
  folder: string = "profiles"
): Promise<string> => {
  const fileExtension = file.originalname.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: configs.awsBucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  });

  await upload.done();

  return `https://${configs.awsBucketName}.s3.${configs.awsRegion}.amazonaws.com/${fileName}`;
};

export const deleteFileFromS3 = async (fileUrl: string): Promise<void> => {
  try {
    if (!fileUrl) return;
    const baseUrl = `https://${configs.awsBucketName}.s3.${configs.awsRegion}.amazonaws.com/`;
    if (!fileUrl.startsWith(baseUrl)) {
      console.warn("File URL does not match bucket URL, skipping deletion from S3:", fileUrl);
      return;
    }

    const key = fileUrl.replace(baseUrl, "");

    const command = new DeleteObjectCommand({
      Bucket: configs.awsBucketName,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
  }
};

export default s3Client;
