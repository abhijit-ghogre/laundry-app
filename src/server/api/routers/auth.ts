import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { sendOtpEmail } from "~/server/email";
import { success, toastError } from "~/utils/response";

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const authRouter = {
  sendOtp: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const { email } = input;

      await ctx.db.otpToken.deleteMany({
        where: { email },
      });

      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await ctx.db.otpToken.create({
        data: {
          email,
          otp,
          expiresAt,
        },
      });

      await sendOtpEmail(email, otp);

      return success();
    }),

  verifyOtp: publicProcedure
    .input(z.object({ email: z.string().email(), otp: z.string().length(6) }))
    .mutation(async ({ ctx, input }) => {
      const { email, otp } = input;

      const otpToken = await ctx.db.otpToken.findFirst({
        where: {
          email,
          otp,
          expiresAt: { gt: new Date() },
        },
      });

      if (!otpToken) {
        toastError("Invalid or expired OTP");
      }

      await ctx.db.otpToken.deleteMany({
        where: { email },
      });

      let user = await ctx.db.user.findUnique({
        where: { email },
        select: { id: true },
      });

      user ??= await ctx.db.user.create({
        data: { email },
        select: { id: true },
      });

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const session = await ctx.db.session.create({
        data: {
          userId: user.id,
          expiresAt,
        },
        select: { id: true },
      });

      return { sessionId: session.id };
    }),

  getSession: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      return null;
    }

    return {
      userId: ctx.session.userId,
      email: ctx.session.user.email,
    };
  }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    if (ctx.session) {
      await ctx.db.session.delete({
        where: { id: ctx.session.id },
      });
    }
    return success();
  }),
} satisfies TRPCRouterRecord;
