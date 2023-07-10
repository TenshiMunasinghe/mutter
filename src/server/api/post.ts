import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getSome: publicProcedure.query(async ({ ctx }) => {
    const res = await ctx.prisma.post.findMany({
      take: 10,
      where: {
        parentId: null,
      },
    });

    const users = await clerkClient.users.getUserList({
      userId: res.map((post) => post.userId),
      limit: 100,
    });

    return res.map((post) => {
      const author = users.find((u) => u.id === post.userId);
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
  makePost: protectedProcedure
    .input(z.object({ content: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.post.create({
          data: {
            ...input,
          },
        });
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    }),
});
