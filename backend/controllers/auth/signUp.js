import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { RoleType, StatusType } from "@prisma/client";

const prisma = new PrismaClient();

export const signUp = async (req, res) => {
  const { firstName, lastName, username, password } = req.body;

  if (!firstName || !lastName || !username || !password) {
    return res.status(400).json({ message: "Missing required field(s)" });
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

  if (/^[a-z0-9._]+$/.test(username) === false) {
    return res
      .status(400)
      .json({ message: "Username contains invalid characters" });
  }

  if (username.length > 20) {
    return res.status(400).json({ message: "Username is too long" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password is too short" });
  }

  if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/.test(password) === false) {
    return res.status(400).json({
      message:
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character",
    });
  }

  try {
    await prisma.$transaction(async (trx) => {
      const duplicateUser = await trx.user.findFirst({
        where: {
          username: username,
        },
      });

      if (duplicateUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const firstUser = await trx.user.findFirst();
      const newUser = await trx.user.create({
        data: {
          ...req.body,
          password: hashedPassword,
          ...(!firstUser && { role: RoleType.SUPER_ADMIN }),
          ...(!firstUser && { status: StatusType.ACTIVE }),
        },
      });

      return res.status(201).json({ ...newUser });
    });
  } catch (err) {
    throw err;
  }
};
