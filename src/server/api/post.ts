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
      select: { id: true },
    });

    return posts;
  }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No post found.",
        });
      }

      const author = await clerkClient.users.getUser(post.userId);

      const likes = await ctx.prisma.like.findMany({
        where: {
          postId: post.id,
        },
      });

      const remuts = await ctx.prisma.remut.findMany({
        where: {
          postId: post.id,
        },
      });

      const comments = await ctx.prisma.post.findMany({
        where: {
          parentId: post.id,
        },
      });

      return {
        author: { name: author.username, image: author.imageUrl },
        likes,
        remuts,
        comments,
        ...post,
      };
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
        const isRemutExist = !!(await ctx.prisma.remut.findUnique({
          where: { userId_postId: remutIds },
        }));
        if (isRemutExist) {
          const res = await ctx.prisma.remut.delete({
            where: { userId_postId: remutIds },
          });

          return res;
        } else {
          const res = await ctx.prisma.remut.create({
            data: remutIds,
          });

          return res;
        }
      } catch (error) {
        return { error };
      }
    }),
  like: protectedProcedure
    .input(z.object({ postId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const likeIds = {
          postId: input.postId,
          userId: input.userId,
        };
        const islikeExist = !!(await ctx.prisma.like.findUnique({
          where: { userId_postId: likeIds },
        }));
        if (islikeExist) {
          const res = await ctx.prisma.like.delete({
            where: { userId_postId: likeIds },
          });

          return res;
        } else {
          const res = await ctx.prisma.like.create({
            data: likeIds,
          });

          return res;
        }
      } catch (error) {
        return { error };
      }
    }),
});
