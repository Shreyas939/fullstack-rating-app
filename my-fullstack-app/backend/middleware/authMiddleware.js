import jwt from "jsonwebtoken";
import {ApiError} from "../utils/ApiError.js";

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        throw new ApiError(401, "Authorization header missing");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new ApiError(401, "Token missing");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, role }

      // Role-based check
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        throw new ApiError(403, "Forbidden: insufficient permissions");
      }

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new ApiError(401, "Token expired"));
      }
      if (err.name === "JsonWebTokenError") {
        return next(new ApiError(401, "Invalid token"));
      }
      return next(err);
    }
  };
};

export default authMiddleware;
