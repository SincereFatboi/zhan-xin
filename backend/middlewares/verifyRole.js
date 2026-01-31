import { RoleType } from "@prisma/client";

export const verifyRole = (role) => {
  return (req, res, next) => {
    const userRole = req.user?.role || req.role; // support either shape
    if (!userRole) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (Object.values(RoleType).includes(userRole) && role.includes(userRole)) {
      next();
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};
