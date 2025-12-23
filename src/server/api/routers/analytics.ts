import type { TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure } from "~/server/api/trpc";

export const analyticsRouter = {
  getExpenditure: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const yearStart = new Date(now.getFullYear(), 0, 1);

    const loads = await ctx.db.load.findMany({
      where: {
        userId: ctx.session.userId,
        pickupDate: { gte: yearStart },
      },
      select: {
        pickupDate: true,
        items: {
          select: {
            rate: true,
            count: true,
          },
        },
      },
    });

    let weeklyExpenditure = 0;
    let monthlyExpenditure = 0;
    let yearlyExpenditure = 0;

    for (const load of loads) {
      const loadTotal = load.items.reduce(
        (sum, item) => sum + item.rate * item.count,
        0,
      );

      yearlyExpenditure += loadTotal;

      if (load.pickupDate >= monthStart) {
        monthlyExpenditure += loadTotal;
      }

      if (load.pickupDate >= weekStart) {
        weeklyExpenditure += loadTotal;
      }
    }

    const monthlyData = await ctx.db.load.findMany({
      where: {
        userId: ctx.session.userId,
        pickupDate: { gte: yearStart },
      },
      select: {
        pickupDate: true,
        items: {
          select: {
            rate: true,
            count: true,
          },
        },
      },
    });

    const monthlyBreakdown: Record<string, number> = {};
    for (const load of monthlyData) {
      const monthKey = `${load.pickupDate.getFullYear()}-${String(load.pickupDate.getMonth() + 1).padStart(2, "0")}`;
      const loadTotal = load.items.reduce(
        (sum, item) => sum + item.rate * item.count,
        0,
      );
      monthlyBreakdown[monthKey] =
        (monthlyBreakdown[monthKey] ?? 0) + loadTotal;
    }

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const chartData = months.map((month, index) => {
      const key = `${now.getFullYear()}-${String(index + 1).padStart(2, "0")}`;
      return {
        month,
        amount: monthlyBreakdown[key] ?? 0,
      };
    });

    return {
      weekly: weeklyExpenditure,
      monthly: monthlyExpenditure,
      yearly: yearlyExpenditure,
      chartData,
    };
  }),
} satisfies TRPCRouterRecord;
