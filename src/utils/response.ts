import { TRPCError } from "@trpc/server";

export const success = () => {
  return { success: true };
};

export const toastError = (message: string) => {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message,
  });
};
