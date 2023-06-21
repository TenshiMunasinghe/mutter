import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getSome: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany({ take: 10 });
  }),
});
