import nodemailer from "nodemailer";
import configurations from "../config/env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: configurations?.gmailUser,
    pass: configurations?.gmailPassword,
  },
});

const sendMail = async (template: string, dynamicData: any) => {
  try {
    const mailOptions = {
      from: configurations?.gmailUser,
      to: dynamicData.to_email,
      subject: dynamicData.subject,
      html: template,
    };

    const emailResult = await transporter.sendMail(mailOptions);
    console.log("Email sent:", emailResult?.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default {
  sendMail,
};
