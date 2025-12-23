import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { success, toastError } from "~/utils/response";

export const clothTypeRouter = {
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        ironRate: z.number().nonnegative(),
        washRate: z.number().nonnegative(),
        dryCleanRate: z.number().nonnegative(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, ironRate, washRate, dryCleanRate } = input;

      const clothType = await ctx.db.clothType.create({
        data: {
          userId: ctx.session.userId,
          name,
          ironRate,
          washRate,
          dryCleanRate,
        },
        select: {
          id: true,
          name: true,
          ironRate: true,
          washRate: true,
          dryCleanRate: true,
        },
      });

      return clothType;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        ironRate: z.number().nonnegative(),
        washRate: z.number().nonnegative(),
        dryCleanRate: z.number().nonnegative(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, ironRate, washRate, dryCleanRate } = input;

      const existing = await ctx.db.clothType.findFirst({
        where: { id, userId: ctx.session.userId },
        select: { id: true },
      });

      if (!existing) {
        toastError("Cloth type not found");
      }

      await ctx.db.clothType.update({
        where: { id },
        data: { name, ironRate, washRate, dryCleanRate },
      });

      return success();
    }),

  toggleActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const existing = await ctx.db.clothType.findFirst({
        where: { id, userId: ctx.session.userId },
        select: { id: true, isActive: true },
      });

      if (!existing) {
        toastError("Cloth type not found");
      }

      await ctx.db.clothType.update({
        where: { id },
        data: { isActive: !existing!.isActive },
      });

      return success();
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const clothTypes = await ctx.db.clothType.findMany({
      where: { userId: ctx.session.userId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        ironRate: true,
        washRate: true,
        dryCleanRate: true,
        isActive: true,
      },
    });

    return clothTypes;
  }),

  listActive: protectedProcedure.query(async ({ ctx }) => {
    const clothTypes = await ctx.db.clothType.findMany({
      where: { userId: ctx.session.userId, isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        ironRate: true,
        washRate: true,
        dryCleanRate: true,
      },
    });

    return clothTypes;
  }),
} satisfies TRPCRouterRecord;
