import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { success, toastError } from "~/utils/response";

const loadItemSchema = z.object({
  clothType: z.string().min(1),
  rate: z.number().positive(),
  count: z.number().int().positive(),
});

const loadTypeSchema = z.enum(["IRON", "WASH", "DRY_CLEAN"]);

export const loadRouter = {
  create: protectedProcedure
    .input(
      z.object({
        shopId: z.string(),
        loadType: loadTypeSchema,
        pickupDate: z.date(),
        items: z.array(loadItemSchema).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { shopId, loadType, pickupDate, items } = input;

      const shop = await ctx.db.shop.findFirst({
        where: { id: shopId, userId: ctx.session.userId },
        select: { id: true },
      });

      if (!shop) {
        toastError("Shop not found");
      }

      const load = await ctx.db.load.create({
        data: {
          userId: ctx.session.userId,
          shopId,
          loadType,
          pickupDate,
          items: {
            create: items,
          },
        },
        select: { id: true },
      });

      return load;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        shopId: z.string(),
        loadType: loadTypeSchema,
        pickupDate: z.date(),
        items: z.array(loadItemSchema).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, shopId, loadType, pickupDate, items } = input;

      const existingLoad = await ctx.db.load.findFirst({
        where: { id, userId: ctx.session.userId },
        select: { id: true },
      });

      if (!existingLoad) {
        toastError("Load not found");
      }

      const shop = await ctx.db.shop.findFirst({
        where: { id: shopId, userId: ctx.session.userId },
        select: { id: true },
      });

      if (!shop) {
        toastError("Shop not found");
      }

      await ctx.db.loadItem.deleteMany({
        where: { loadId: id },
      });

      await ctx.db.load.update({
        where: { id },
        data: {
          shopId,
          loadType,
          pickupDate,
          items: {
            create: items,
          },
        },
      });

      return success();
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const existingLoad = await ctx.db.load.findFirst({
        where: { id, userId: ctx.session.userId },
        select: { id: true },
      });

      if (!existingLoad) {
        toastError("Load not found");
      }

      await ctx.db.load.delete({
        where: { id },
      });

      return success();
    }),

  markDelivered: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const existingLoad = await ctx.db.load.findFirst({
        where: { id, userId: ctx.session.userId },
        select: { id: true },
      });

      if (!existingLoad) {
        toastError("Load not found");
      }

      await ctx.db.load.update({
        where: { id },
        data: {
          isDelivered: true,
          deliveredAt: new Date(),
        },
      });

      return success();
    }),

  unmarkDelivered: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const existingLoad = await ctx.db.load.findFirst({
        where: { id, userId: ctx.session.userId },
        select: { id: true },
      });

      if (!existingLoad) {
        toastError("Load not found");
      }

      await ctx.db.load.update({
        where: { id },
        data: {
          isDelivered: false,
          deliveredAt: null,
        },
      });

      return success();
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const load = await ctx.db.load.findFirst({
        where: { id, userId: ctx.session.userId },
        select: {
          id: true,
          shopId: true,
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          loadType: true,
          pickupDate: true,
          isDelivered: true,
          deliveredAt: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              clothType: true,
              rate: true,
              count: true,
            },
          },
        },
      });

      if (!load) {
        toastError("Load not found");
      }

      return load;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const loads = await ctx.db.load.findMany({
      where: { userId: ctx.session.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        shopId: true,
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
        loadType: true,
        pickupDate: true,
        isDelivered: true,
        deliveredAt: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            clothType: true,
            rate: true,
            count: true,
          },
        },
      },
    });

    return loads;
  }),

  getLastRates: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.loadItem.findMany({
      where: {
        load: { userId: ctx.session.userId },
      },
      orderBy: {
        load: { createdAt: "desc" },
      },
      select: {
        clothType: true,
        rate: true,
      },
    });

    const rateMap: Record<string, number> = {};
    for (const item of items) {
      const key = item.clothType.toLowerCase();
      if (!(key in rateMap)) {
        rateMap[key] = item.rate;
      }
    }

    return rateMap;
  }),
} satisfies TRPCRouterRecord;
