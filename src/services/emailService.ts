import nodemailer from "nodemailer";
import { config } from "../config";
import { logger } from "../logging";

let transporter;

switch (process.env.EMAIL_SERVICE_PROVIDER) {
  case "MAILGUN":
    logger.info("Using Mailgun as email provider");
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
    break;
  case "SENDGRID":
    logger.info("Using SendGrid as email provider");
    transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
    break;
  case "SES":
    logger.info("Using SES as email provider");
    transporter = nodemailer.createTransport({
      SES: { ses: require("aws-sdk/clients/ses"), aws: require("aws-sdk") },
    });
    break;
  default:
    logger.error(
      "Unsupported EMAIL_SERVICE_PROVIDER: " +
        process.env.EMAIL_SERVICE_PROVIDER
    );
    throw new Error("Unsupported EMAIL_SERVICE_PROVIDER");
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  logger.info(`Sending email to: ${to}, subject: ${subject}`);
  try {
    const result = await transporter.sendMail({
      from: config.emailFrom,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to: ${to}, subject: ${subject}`);
    logger.debug({ message: "Email send result", result });
    return result;
  } catch (err) {
    logger.error({ message: "Failed to send email", error: err, to, subject });
    throw err;
  }
};
