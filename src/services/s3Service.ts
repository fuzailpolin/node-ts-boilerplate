import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { config } from "../config";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../logging";

const s3 = new S3Client({
  region: "us-east-1", // Set your region or make it configurable
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

export const uploadFile = async (
  buffer: Buffer,
  mimetype: string,
  userId: string
) => {
  const key = `${userId}/${uuidv4()}`;
  logger.info(`Uploading file to S3 for user: ${userId}, key: ${key}`);
  const params = {
    Bucket: config.aws.s3Bucket,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    ACL: "public-read" as ObjectCannedACL,
  };
  try {
    const result = await s3.send(new PutObjectCommand(params));
    const url = `https://${params.Bucket}.s3.amazonaws.com/${key}`;
    logger.info(`File uploaded to S3: ${url}`);
    logger.debug({ message: "S3 upload result", result });
    return { url, key };
  } catch (err) {
    logger.error({ message: "S3 upload failed", error: err, key });
    throw err;
  }
};
