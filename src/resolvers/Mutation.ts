import { Post } from "../generated/prisma/index.js";
import { Context } from "../server.js";
interface PostCreateArgs {
  post: {
    title: string;
    content: string;
  };
}

interface PostUpdateArgs {
  postId: string;
  post: {
    title?: string;
    content?: string;
  };
}

interface PostPayloadType {
  userErrors: {
    message: string;
  }[];
  post: Post | null;
}
export const Mutation = {
  postCreate: async (
    _: any,
    { post }: PostCreateArgs,
    { prisma }: Context
  ): Promise<PostPayloadType> => {
    const { title, content } = post;
    if (!title || !content) {
      return {
        userErrors: [
          {
            message: "You must provide a title and a content to create a post",
          },
        ],
        post: null,
      };
    }
    const createdPost = await prisma.post.create({
      data: {
        title,
        content,
        authorId: 1,
      },
    });
    return {
      userErrors: [],
      post: createdPost,
    };
  },
  postUpdate: async (
    _: any,
    { postId, post }: PostUpdateArgs,
    { prisma }: Context
  ): Promise<PostPayloadType> => {
    const { title, content } = post;
    if (!title && !content) {
      return {
        userErrors: [
          {
            message: "Provide at least one field to update",
          },
        ],
        post: null,
      };
    }

    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
    });

    if (!existingPost) {
      return {
        userErrors: [
          {
            message: "Post with such id does not exist",
          },
        ],
        post: null,
      };
    }
    let payloadToUpdate = {
      title,
      content,
    };
    if (!title) delete payloadToUpdate.title;
    if (!content) delete payloadToUpdate.content;

    const updatedPost = await prisma.post.update({
      data: {
        ...payloadToUpdate,
      },
      where: { id: Number(postId) },
    });

    return {
      userErrors: [],
      post: updatedPost,
    };
  },

  postDelete: async (
    _: any,
    { postId }: { postId: number },
    { prisma }: Context
  ): Promise<PostPayloadType> => {
    if (!postId) {
      return {
        userErrors: [
          {
            message: "Post id is required",
          },
        ],
        post: null,
      };
    }

    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
    });

    if (!existingPost) {
      return {
        userErrors: [
          {
            message: "Post with such id does not exist",
          },
        ],
        post: null,
      };
    }

    const deletedPost = await prisma.post.delete({
      where: { id: Number(postId) },
    });

    return {
      userErrors: [],
      post: deletedPost,
    };
  },
};
