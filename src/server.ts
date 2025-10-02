import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { readFile } from "node:fs/promises";
import { Mutation, Post, Profile, Query, User } from "./resolvers/index.js";
import { PrismaClient } from "./generated/prisma/index.js";
import { extractUser } from "./utils/extractUser.js";

const typeDefs = await readFile("./schema.graphql", "utf8");
const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  userInfo: {
    userId: number;
  } | null;
}

// Apollo server
const server = new ApolloServer<Context>({
  typeDefs,
  resolvers: {
    Query,
    Profile,
    Post,
    User,
    Mutation,
  },
});

async function startServer() {
  await server.start();

  const app = express();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => {
        const userInfo = extractUser(req.headers.authorization!);
        return { prisma, userInfo };
      },
    })
  );

  app.listen(4000, () => {
    console.log("🚀 Server ready at http://localhost:4000/graphql");
  });
}

startServer();
