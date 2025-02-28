import { PrismaClient } from "@prisma/client";
import fastify from "fastify";

export const getAllUsers = {
  schema: {
    query: {
      type: "object",
      properties: {
        page: { type: "integer", default: 1 },
        perPage: { type: "integer", default: 10 },
      },
      required: ["page", "perPage"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          totalUsers: { type: "integer" },
          totalPages: { type: "integer" },
          currentPage: { type: "integer" },
          users: {
            type: "array",
            items: {
              type: "object",
              properties: {
                firstName: { type: "string" },
                lastName: { type: "string" },
                email: { type: "string" },
                role: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  handler: async (req, rep) => {
    const prisma = new PrismaClient();
    const { page, perPage } = req.query;

    const safePage = page <= 0 ? 1 : page;
    const safePerPage = perPage <= 0 ? 5 : perPage;
    // Calculate the `skip` and `take` values for pagination
    const skip = (safePage - 1) * safePerPage;
    const take = safePerPage;

    try {
      // Get the total number of users for calculating total pages
      const totalUsers = await prisma.user.count();

      // Fetch the paginated list of users
      const users = await prisma.user.findMany({
        skip,
        take,
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalUsers / safePerPage);

      // Return paginated users and pagination details
      return rep.code(200).send({
        ok: true,
        totalUsers,
        totalPages,
        currentPage: safePage,
        users,
      });
    } catch (err) {
      throw err;
    }
  },
};
