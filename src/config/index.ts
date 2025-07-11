import dotenv from "dotenv";
dotenv.config();

const requiredEnvs = [
  "DATABASE_URL",
  "JWT_SECRET",
  "EMAIL_FROM",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_S3_BUCKET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "FACEBOOK_CLIENT_ID",
  "FACEBOOK_CLIENT_SECRET",
  "SWAGGER_USER",
  "SWAGGER_PASS",
];

const missing = requiredEnvs.filter((env) => !process.env[env]);
if (missing.length) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`
  );
}

export const config = {
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  emailFrom: process.env.EMAIL_FROM!,
  smtp: {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    s3Bucket: process.env.AWS_S3_BUCKET!,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  },
  swagger: {
    user: process.env.SWAGGER_USER!,
    pass: process.env.SWAGGER_PASS!,
  },
};
