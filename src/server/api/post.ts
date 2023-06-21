import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getSome: publicProcedure.query(async ({ ctx }) => {
    const res = await ctx.prisma.post.findMany({ take: 10 });

    const users = await clerkClient.users.getUserList({
      userId: res.map((p) => p.authorId),
      limit: 100,
    });

    return res.map((post) => {
      const author = users.find((u) => u.id === post.authorId);
      if (!author)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No author found.",
        });
      return {
        author: { name: author.username, image: author.imageUrl },
        ...post,
      };
    });
  }),
});
