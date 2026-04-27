import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } 
  else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized. Token missing.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select("-password")
      .lean();

    if (!user) {
      res.status(401);
      throw new Error("User not found.");
    }

    if (user.isBlocked) {
      res.status(403);
      throw new Error("Your account has been blocked. Contact admin.");
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.message === "Your account has been blocked. Contact admin.") {
      throw error;
    }
    res.status(401);
    throw new Error("Not authorized. Invalid or expired token.");
  }
});

export const authorizeRoles = (...allowedRoles) => {
  const allowedRolesSet = new Set(allowedRoles);

  return (req, res, next) => {
    if (!req.user) {
      res.status(403);
      throw new Error("You are not allowed to access this resource.");
    }

    if (!allowedRolesSet.has(req.user.role)) {
      res.status(403);
      throw new Error("You are not allowed to access this resource.");
    }

    next();
  };
};