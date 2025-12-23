import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { success, toastError } from "~/utils/response";

export const shopRouter = {
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      const existingShops = await ctx.db.shop.count({
        where: { userId: ctx.session.userId },
      });

      const shop = await ctx.db.shop.create({
        data: {
          userId: ctx.session.userId,
          name,
          isDefault: existingShops === 0,
        },
        select: { id: true, name: true, isDefault: true },
      });

      return shop;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id, name } = input;

      const existingShop = await ctx.db.shop.findFirst({
        where: { id, userId: ctx.session.userId },
        select: { id: true },
      });

      if (!existingShop) {
        toastError("Shop not found");
      }

      await ctx.db.shop.update({
        where: { id },
        data: { name },
      });

      return success();
    }),

  toggleActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const existingShop = await ctx.db.shop.findFirst({
        where: { id, userId: ctx.session.userId },
        select: { id: true, isActive: true },
      });

      if (!existingShop) {
        toastError("Shop not found");
      }

      await ctx.db.shop.update({
        where: { id },
        data: { isActive: !existingShop!.isActive },
      });

      return success();
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const shops = await ctx.db.shop.findMany({
      where: { userId: ctx.session.userId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        isDefault: true,
        isActive: true,
      },
    });

    return shops;
  }),

  listActive: protectedProcedure.query(async ({ ctx }) => {
    const shops = await ctx.db.shop.findMany({
      where: { userId: ctx.session.userId, isActive: true },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        isDefault: true,
      },
    });

    return shops;
  }),

  setDefault: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const existingShop = await ctx.db.shop.findFirst({
        where: { id, userId: ctx.session.userId },
        select: { id: true },
      });

      if (!existingShop) {
        toastError("Shop not found");
      }

      await ctx.db.shop.updateMany({
        where: { userId: ctx.session.userId },
        data: { isDefault: false },
      });

      await ctx.db.shop.update({
        where: { id },
        data: { isDefault: true },
      });

      return success();
    }),
} satisfies TRPCRouterRecord;
