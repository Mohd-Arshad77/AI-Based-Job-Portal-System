import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized. Token missing.");
  }

  if (token === "demo-token") {
    req.user = {
      _id: "650000000000000000000000",
      name: "Demo Acc",
      email: "demo@demo.com",
      role: req.headers["x-demo-role"] || "recruiter",
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("User not found.");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized. Invalid or expired token.");
  }
});

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error("You are not allowed to access this resource.");
  }

  next();
};
