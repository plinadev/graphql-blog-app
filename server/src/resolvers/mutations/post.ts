import { Post } from "../../generated/prisma/index.js";
import { Context } from "../../server.js";
import { checkPermission } from "../../utils/checkPermission.js";

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
export const postResolvers = {
  postCreate: async (
    _: any,
    { post }: PostCreateArgs,
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [
          {
            message: "Forbidden access (unauthenticated)",
          },
        ],
        post: null,
      };
    }
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
        authorId: userInfo.userId,
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
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [
          {
            message: "Forbidden access (unauthenticated)",
          },
        ],
        post: null,
      };
    }
    const isNotAllowed = await checkPermission({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });
    if (isNotAllowed) return isNotAllowed;
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
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [
          {
            message: "Forbidden access (unauthenticated)",
          },
        ],
        post: null,
      };
    }
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
    const isNotAllowed = await checkPermission({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });
    if (isNotAllowed) return isNotAllowed;

    const deletedPost = await prisma.post.delete({
      where: { id: Number(postId) },
    });

    return {
      userErrors: [],
      post: deletedPost,
    };
  },
  postPublish: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [
          {
            message: "Forbidden access (unauthenticated)",
          },
        ],
        post: null,
      };
    }
    const isNotAllowed = await checkPermission({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });

    if (isNotAllowed) return isNotAllowed;

    const post = await prisma.post.update({
      where: { id: Number(postId) },
      data: {
        published: true,
      },
    });
    return {
      userErrors: [],
      post: post,
    };
  },
  postUnpublish: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [
          {
            message: "Forbidden access (unauthenticated)",
          },
        ],
        post: null,
      };
    }
    const isNotAllowed = await checkPermission({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });

    if (isNotAllowed) return isNotAllowed;

    const post = await prisma.post.update({
      where: { id: Number(postId) },
      data: {
        published: false,
      },
    });
    return {
      userErrors: [],
      post: post,
    };
  },
};
