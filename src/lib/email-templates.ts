const generateEmailLayout = (content: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <title>ShipFlex</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; line-height: 1.6;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background-color: #ffffff; padding: 40px 40px 30px 40px; text-align: center; border-bottom: 3px solid #735ae5;">
                  <!-- Replace 'YOUR_LOGO_URL_HERE' with your actual hosted logo URL -->
                  <!-- <img 
                    src="YOUR_LOGO_URL_HERE" 
                    alt="ShipFlex" 
                    width="280" 
                    height="63"
                    style="display: block; margin: 0 auto; max-width: 100%; height: auto;" 
                  /> -->
                  <!-- Temporary text-based logo until you have a hosted image -->
                  <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #735ae5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">ShipFlex</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 40px; background-color: #ffffff;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                    &copy; 2026 ShipFlex. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                    123 Shipping Lane, Logistics City, LC 12345
                  </p>
                  <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 12px;">
                    This email was sent to you by ShipFlex. 
                    <a href="#" style="color: #735ae5; text-decoration: none;">Unsubscribe</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const getRegistrationEmailBody = (name: string, otp: number): string => {
  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #1f2937; line-height: 1.3;">
      Welcome to ShipFlex, ${name}!
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
      We are thrilled to have you on board. Your account has been successfully created.
    </p>
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
      Get started by exploring our platform and setting up your preferences.
    </p>
    
    <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-left: 4px solid #667eea; padding: 24px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
        Your Verification Code
      </p>
      <p style="margin: 0; font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 4px; font-family: 'Courier New', monospace;">
        ${otp}
      </p>
    </div>
    
    <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      Please use this code to verify your email address. This code will expire in 5 minutes.
    </p>
  `;
  return generateEmailLayout(content);
};

export const getForgotPasswordEmailBody = (otp: number): string => {
  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #1f2937; line-height: 1.3;">
      Password Reset Request
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
      We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
    </p>
    <p style="margin: 0 0 28px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
      To reset your password, use the verification code below:
    </p>
    
    <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-left: 4px solid #667eea; padding: 24px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
        Your Password Reset Code
      </p>
      <p style="margin: 0; font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 4px; font-family: 'Courier New', monospace;">
        ${otp}
      </p>
    </div>
    
    <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #ef4444; font-weight: 500;">
      ⚠️ This code will expire in 5 minutes for security reasons.
    </p>
  `;
  return generateEmailLayout(content);
};

export const getCoachInvitationEmailBody = (
  name: string,
  inviteUrl: string,
): string => {
  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #1f2937; line-height: 1.3;">
      Coach Invitation
    </h1>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
      Hello ${name},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
      You have been invited as a <strong>Coach</strong>.
    </p>

    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
      Click the button below to accept your invitation and complete your registration.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a 
        href="${inviteUrl}"
        style="
          display: inline-block;
          padding: 14px 32px;
          background: #735ae5;
          color: #ffffff;
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
        "
      >
        Accept Invitation
      </a>
    </div>

    <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      This invitation will expire in 24 hours. If you did not expect this invite, you can safely ignore this email.
    </p>
  `;

  return generateEmailLayout(content);
};

export const getResetPasswordEmailBody = (): string => {
  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 20px; line-height: 80px; text-align: center;">
        <span style="font-size: 48px; color: white;">✓</span>
      </div>
    </div>
    
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #1f2937; line-height: 1.3; text-align: center;">
      Password Changed Successfully
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
      Your password has been successfully updated. You can now log in with your new password.
    </p>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
        <strong>⚠️ Security Alert:</strong> If you did not perform this action, please contact our support team immediately.
      </p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.FRONTEND_BASE_URL}/login" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);">
        Login Now
      </a>
    </div>
  `;
  return generateEmailLayout(content);
};

export default {
  getRegistrationEmailBody,
  getForgotPasswordEmailBody,
  getResetPasswordEmailBody,
  getCoachInvitationEmailBody,
};
