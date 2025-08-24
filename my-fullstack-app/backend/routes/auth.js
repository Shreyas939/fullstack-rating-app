import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const signupUser = asyncHandler(async (req, res) => {
  const { name, email, address, password } = req.body;

  // 🔹 Name validation (min 20 as per PDF)
  if (!name || name.length < 20 || name.length > 60) {
    throw new ApiError(400, "Name must be between 20 and 60 characters");
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "Valid email is required");
  }
  if (address && address.length > 400) {
    throw new ApiError(400, "Address must not exceed 400 characters");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }
  if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(password)) {
    throw new ApiError(
      400,
      "Password must be 8-16 characters, include 1 uppercase letter and 1 special character"
    );
  }

  // 🔹 Check if email already exists
  const exists = await db.query("SELECT id FROM users WHERE email=$1", [email]);
  if (exists.rows.length) {
    throw new ApiError(400, "Email already registered");
  }

  // 🔹 Hash password
  const hash = await bcrypt.hash(password, 10);

  // 🔹 Get default role (normal_user)
  const roleRes = await db.query("SELECT id FROM roles WHERE name='normal_user' LIMIT 1");
  const roleId = roleRes.rows[0].id;

  // 🔹 Insert new user
  const result = await db.query(
    `INSERT INTO users (name, email, address, password_hash, role_id)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, name, email, role_id`,
    [name, email, address, hash, roleId]
  );

  const user = result.rows[0];

  // 🔹 Generate JWTs
  const accessToken = jwt.sign(
    { id: user.id, role: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user,
        accessToken,
        refreshToken,
      },
      "User registered successfully"
    )
  );
});

router.post("/signup", signupUser);

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");

  const result = await db.query(
    "SELECT id, name, email, password_hash, role_id FROM users WHERE email=$1",
    [email]
  );
  const user = result.rows[0];

  if (!user) throw new ApiError(404, "User does not exist");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new ApiError(401, "Password is incorrect");

  const accessToken = jwt.sign(
    { id: user.id, role: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
        },
        accessToken,
        refreshToken,
      },
      "User logged in successfully"
    )
  );
});

router.post("/login", loginUser);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token required");
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      // issue new access token
      const newAccessToken = jwt.sign(
        { id: decoded.id, role: decoded.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json(
        new ApiResponse(200, { accessToken: newAccessToken }, "Token refreshed")
      );
    } catch (err) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
  })
);


router.put(
  "/update-password",
  authMiddleware(), // any logged-in user
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const userRes = await db.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );

    if (!userRes.rows.length) {
      throw new ApiError(404, "User not found");
    }

    const validPassword = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!validPassword) {
      throw new ApiError(400, "Current password is incorrect");
    }

    if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(newPassword)) {
      throw new ApiError(
        400,
        "New password must be 8-16 characters, include 1 uppercase letter and 1 special character"
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newHash,
      userId,
    ]);

    res.json(new ApiResponse(200, null, "Password updated successfully"));
  })
);


export default router;
