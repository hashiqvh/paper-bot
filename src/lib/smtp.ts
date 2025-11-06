import { decrypt } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function getSmtpTransporter() {
  const smtpSettings = await prisma.smtpSettings.findFirst();
  if (!smtpSettings) {
    throw new Error("SMTP settings not configured");
  }

  // Decrypt the password
  const decryptedPassword = decrypt(smtpSettings.password);

  // Configure transport based on port and secure setting
  // Port 465 uses direct SSL/TLS (secure: true)
  // Port 587 uses STARTTLS (secure: false, requireTLS: true)
  // Other ports use the secure setting as configured
  const isPort465 = smtpSettings.port === 465;
  const isPort587 = smtpSettings.port === 587;

  const transportConfig: any = {
    host: smtpSettings.host,
    port: smtpSettings.port,
    auth: {
      user: smtpSettings.username,
      pass: decryptedPassword,
    },
  };

  if (isPort465) {
    // Port 465 always uses direct SSL/TLS
    transportConfig.secure = true;
  } else if (isPort587) {
    // Port 587 uses STARTTLS
    transportConfig.secure = false;
    transportConfig.requireTLS = true;
  } else {
    // For other ports, use the configured secure setting
    transportConfig.secure = smtpSettings.secure;
    if (smtpSettings.secure) {
      transportConfig.requireTLS = true;
    }
  }

  return nodemailer.createTransport(transportConfig);
}

