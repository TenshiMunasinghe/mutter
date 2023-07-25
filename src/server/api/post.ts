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
    const posts = await ctx.prisma.post.findMany({
      take: 10,
      where: {
        parentId: null,
      },
    });

    const users = await clerkClient.users.getUserList({
      userId: posts.map((post) => post.userId),
      limit: 100,
    });

    const likes = await ctx.prisma.likes.findMany({
      where: {
        postId: { in: posts.map((post) => post.id) },
      },
    });

    const remuts = await ctx.prisma.userPostRemut.findMany({
      where: {
        postId: { in: posts.map((post) => post.id) },
      },
    });

    const comments = await ctx.prisma.post.findMany({
      where: {
        parentId: {
          in: posts.map((post) => post.parentId ?? ""),
        },
      },
    });

    return posts.map((post) => {
      const author = users.find((u) => u.id === post.userId);
      if (!author)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No author found.",
        });
      return {
        author: { name: author.username, image: author.imageUrl },
        likes: likes.filter((like) => like.postId === post.id),
        remuts: remuts.filter((remut) => remut.postId === post.id),
        comments: comments.filter((comment) => comment.parentId === post.id),
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
  remut: protectedProcedure
    .input(z.object({ postId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const remutIds = {
          postId: input.postId,
          userId: input.userId,
        };
        const isRemutExist = !!(await ctx.prisma.userPostRemut.findUnique({
          where: { userId_postId: remutIds },
        }));
        if (isRemutExist) {
          const res = await ctx.prisma.userPostRemut.delete({
            where: { userId_postId: remutIds },
          });

          return res;
        } else {
          const res = await ctx.prisma.userPostRemut.create({
            data: remutIds,
          });

          return res;
        }
      } catch (error) {
        return { error };
      }
    }),
});
