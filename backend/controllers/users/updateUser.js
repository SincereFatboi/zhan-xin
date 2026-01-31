import { PrismaClient } from "@prisma/client";
import { RoleType, StatusType } from "@prisma/client";

const prisma = new PrismaClient();

export const updateUser = async (req, res) => {
  let { id } = req.params;
  const { username, firstName, lastName, role, status } = req.body;

  id = decodeURIComponent(id.trim());

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!username || !firstName || !lastName || !role || !status) {
    return res.status(400).json({ message: "Missing required field(s)" });
  }

  if (/^[a-z0-9._]+$/.test(username) === false) {
    return res
      .status(400)
      .json({ message: "Username contains invalid characters" });
  }

  if (username.length > 20) {
    return res.status(400).json({ message: "Username is too long" });
  }

  if (/^[A-Za-z]+$/.test(firstName) === false) {
    return res
      .status(400)
      .json({ message: "First name contains invalid characters" });
  }

  if (firstName.length > 20) {
    return res.status(400).json({ message: "First name is too long" });
  }

  if (/^[A-Za-z]+$/.test(lastName) === false) {
    return res
      .status(400)
      .json({ message: "Last name contains invalid characters" });
  }

  if (lastName.length > 20) {
    return res.status(400).json({ message: "Last name is too long" });
  }

  if (!Object.values(RoleType).includes(role)) {
    return res.status(400).json({ message: "Invalid role type" });
  }

  if (!Object.values(StatusType).includes(status)) {
    return res.status(400).json({ message: "Invalid status type" });
  }

  try {
    prisma.$transaction(async (trx) => {
      const existingUser = await trx.user.findFirst({
        where: { id },
      });

      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updated = await prisma.user.update({
        where: { id },
        data: {
          username,
          firstName,
          lastName,
          role,
          status,
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
        },
      });
      return res
        .status(200)
        .json({ message: "User updated successfully", user: updated });
    });
  } catch (err) {
    console.error("Error updating user", err);
    return res.status(500).json({ message: "Error updating user" });
  }
};
