import { User } from "../../generated/prisma/index.js";
import { Context } from "../../server.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

interface SignupArgs {
  credentials: {
    email: string;
    password: string;
  };
  name: string;
  bio: string;
}

interface SigninArgs {
  credentials: {
    email: string;
    password: string;
  };
}

interface UserPayload {
  userErrors: {
    message: string;
  }[];
  token: string | null;
}
export const authResolvers = {
  signup: async (
    _: any,
    { credentials, name, bio }: SignupArgs,
    { prisma }: Context
  ): Promise<UserPayload> => {
    const { email, password } = credentials;
    const isEmail = validator.isEmail(email);
    if (!isEmail) {
      return {
        userErrors: [
          {
            message: "Email is invalid",
          },
        ],
        token: null,
      };
    }
    const isValidPassword = validator.isLength(password, {
      min: 5,
    });
    if (!isValidPassword) {
      return {
        userErrors: [
          {
            message: "Password should be at least 5 characters long",
          },
        ],
        token: null,
      };
    }
    if (!name || !bio) {
      return {
        userErrors: [
          {
            message: "Name and bio are required",
          },
        ],
        token: null,
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    //create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    //create profile
    await prisma.profile.create({
      data: {
        bio,
        userId: user.id,
      },
    });

    const token = JWT.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: 3600000, //1 hour
      }
    );

    return {
      userErrors: [],
      token,
    };
  },
  signin: async (
    _: any,
    { credentials }: SigninArgs,
    { prisma }: Context
  ): Promise<UserPayload> => {
    const { email, password } = credentials;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return {
        userErrors: [
          {
            message: "Email or password are invalid",
          },
        ],
        token: null,
      };
    }
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      return {
        userErrors: [
          {
            message: "Email or password are invalid",
          },
        ],
        token: null,
      };
    }

    const token = JWT.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: 3600000, //1 hour
      }
    );

    return {
      userErrors: [],
      token,
    };
  },
};
