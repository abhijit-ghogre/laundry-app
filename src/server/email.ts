import { Resend } from "resend";
import { env } from "~/env";

export const resend = new Resend(env.RESEND_API_KEY as string);

export const sendOtpEmail = async (email: string, otp: string) => {
  await resend.emails.send({
    from: "LaundryApp <noreply@laundryapp.abhijitghogre.com>",
    to: email,
    subject: "Your Login OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Login to LaundryApp</h2>
        <p style="color: #666;">Your one-time password is:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 12px;">This OTP will expire in 10 minutes.</p>
      </div>
    `,
  });
};
