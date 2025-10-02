import { PrismaClient } from "../generated/prisma/index.js";

interface checkPermissionParams {
  userId: number;
  postId: number;
  prisma: PrismaClient;
}
export const checkPermission = async ({
  userId,
  postId,
  prisma,
}: checkPermissionParams) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return {
      userErrors: [
        {
          message: "User not found",
        },
      ],
      post: null,
    };
  }
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });
  if (post?.authorId !== user.id) {
    return {
      userErrors: [
        {
          message: "Update permission denied",
        },
      ],
      post: null,
    };
  }
};
