import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const deleteUsers = async (req, res) => {
  let { id } = req.params;
  const requesterId = req.id;

  id = decodeURIComponent(id.trim());

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (requesterId && requesterId === id) {
    return res
      .status(403)
      .json({ message: "You cannot delete your own account" });
  }

  try {
    await prisma.$transaction(async (trx) => {
      const existingUser = await trx.user.findFirst({ where: { id } });

      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      await trx.user.delete({ where: { id } });
    });

    return res.status(204).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user", err);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};
