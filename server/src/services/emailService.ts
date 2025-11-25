import nodemailer from 'nodemailer';
import path from 'path';
import ejs from 'ejs';
import { config } from '../config/env';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure, // true for 465, false for other ports
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service configuration error:', error);
  } else {
    console.log('✓ Email service is ready to send messages');
  }
});

export interface CredentialsEmailData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  loginUrl: string;
}

/**
 * Send credentials email to newly created employee
 */
export const sendCredentialsEmail = async (data: CredentialsEmailData): Promise<void> => {
  try {
    // Render EJS template
    // Template path - works for both development and production
    const templatePath = path.join(__dirname, '../../templates/credentials-email.ejs');
    const html = await ejs.renderFile(templatePath, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: data.role,
      loginUrl: data.loginUrl,
      appName: config.app.name,
      appUrl: config.app.url,
    });

    // Email options
    const mailOptions = {
      from: `"${config.app.name}" <${config.email.from}>`,
      to: data.email,
      subject: `Welcome to ${config.app.name} - Your Account Credentials`,
      html: html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Credentials email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending credentials email:', error);
    // Don't throw error - we don't want email failure to break user creation
    // Log it for monitoring purposes
  }
};

/**
 * Send password reset email when user changes their password
 */
export const sendPasswordResetEmail = async (data: CredentialsEmailData): Promise<void> => {
  try {
    // Render EJS template
    const templatePath = path.join(__dirname, '../../templates/password-reset-email.ejs');
    const html = await ejs.renderFile(templatePath, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: data.role,
      loginUrl: data.loginUrl,
      appName: config.app.name,
      appUrl: config.app.url,
    });

    // Email options
    const mailOptions = {
      from: `"${config.app.name}" <${config.email.from}>`,
      to: data.email,
      subject: `Your ${config.app.name} Password Has Been Changed`,
      html: html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Password reset email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // Don't throw error - we don't want email failure to break password change
  }
};

export default transporter;

