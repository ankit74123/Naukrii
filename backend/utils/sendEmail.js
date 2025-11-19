import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use actual email service
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Development: Use ethereal for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.EMAIL_PASSWORD || 'ethereal.password',
      },
    });
  }
};

// Send email function
export const sendEmail = async (options) => {
  const transporter = createTransporter();

  const message = {
    from: `${process.env.FROM_NAME || 'Job Portal'} <${process.env.FROM_EMAIL || 'noreply@jobportal.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
  return info;
};

// Email templates
export const emailTemplates = {
  welcome: (name) => `
    <h1>Welcome to Job Portal, ${name}!</h1>
    <p>Thank you for registering. We're excited to have you on board.</p>
    <p>Start exploring thousands of job opportunities today!</p>
  `,

  applicationReceived: (jobTitle, applicantName) => `
    <h1>New Application Received</h1>
    <p>${applicantName} has applied for the position: <strong>${jobTitle}</strong></p>
    <p>Log in to review the application and candidate profile.</p>
  `,

  applicationStatusUpdate: (jobTitle, status) => `
    <h1>Application Status Update</h1>
    <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
    <p>New Status: <strong>${status}</strong></p>
    <p>Log in to view more details.</p>
  `,

  jobAlert: (jobs) => `
    <h1>New Jobs Matching Your Criteria</h1>
    <p>We found ${jobs.length} new job(s) that match your job alert preferences:</p>
    <ul>
      ${jobs.map(job => `<li><strong>${job.title}</strong> at ${job.company}</li>`).join('')}
    </ul>
    <p>Log in to view these opportunities!</p>
  `,

  interviewScheduled: (jobTitle, date, time) => `
    <h1>Interview Scheduled</h1>
    <p>Your interview for <strong>${jobTitle}</strong> has been scheduled.</p>
    <p>Date: ${date}</p>
    <p>Time: ${time}</p>
    <p>Good luck!</p>
  `,
};

export default sendEmail;
