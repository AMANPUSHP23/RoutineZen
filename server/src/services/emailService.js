const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Load and compile email templates
const loadTemplate = async (templateName) => {
  const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
  const template = await fs.readFile(templatePath, 'utf-8');
  return handlebars.compile(template);
};

// Send invitation email
const sendInvitationEmail = async (invitation) => {
  try {
    const template = await loadTemplate('invitation');
    const verificationUrl = `${process.env.CLIENT_URL}/verify-invitation/${invitation.token}`;
    
    const html = template({
      taskName: invitation.taskName,
      inviterEmail: invitation.inviterEmail,
      message: invitation.message,
      verificationUrl,
      expiryHours: 24
    });

    const mailOptions = {
      from: `"RoutineZen" <${process.env.SMTP_FROM}>`,
      to: invitation.inviteeEmail,
      subject: `Invitation to collaborate on "${invitation.taskName}"`,
      html
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
  try {
    const template = await loadTemplate('verification');
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    
    const html = template({
      name: user.name,
      verificationUrl,
      expiryHours: 24
    });

    const mailOptions = {
      from: `"RoutineZen" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: 'Verify your email address',
      html
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  try {
    const template = await loadTemplate('password-reset');
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    
    const html = template({
      name: user.name,
      resetUrl,
      expiryHours: 1
    });

    const mailOptions = {
      from: `"RoutineZen" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: 'Reset your password',
      html
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = {
  sendInvitationEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
}; 