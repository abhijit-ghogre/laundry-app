import { analyticsRouter } from "~/server/api/routers/analytics";
import { authRouter } from "~/server/api/routers/auth";
import { clothTypeRouter } from "~/server/api/routers/clothType";
import { loadRouter } from "~/server/api/routers/load";
import { shopRouter } from "~/server/api/routers/shop";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  analytics: analyticsRouter,
  auth: authRouter,
  clothType: clothTypeRouter,
  load: loadRouter,
  shop: shopRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
