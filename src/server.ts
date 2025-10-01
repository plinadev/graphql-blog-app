import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { readFile } from "node:fs/promises";
import { Mutation, Query } from "./resolvers/index.js";
import { PrismaClient } from "./generated/prisma/index.js";

const typeDefs = await readFile("./schema.graphql", "utf8");
const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
}

// Apollo server
const server = new ApolloServer<Context>({
  typeDefs,
  resolvers: {
    Query,
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
      context: async ({ req }) => {
        return { prisma };
      },
    })
  );

  app.listen(4000, () => {
    console.log("🚀 Server ready at http://localhost:4000/graphql");
  });
}

startServer();
