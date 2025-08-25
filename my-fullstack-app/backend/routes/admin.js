import express from "express";
import db from "../db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import authMiddleware from "../middleware/authMiddleware.js";
import bcrypt from "bcrypt";

const router = express.Router();

// filtering for admin
router.get(
  "/users",
  authMiddleware([1]), // role_id=1 is system_admin
  asyncHandler(async (req, res) => {
    const { name, email, address, role, sort = "name", dir = "asc" } = req.query;

    const allowedSortFields = ["name", "email", "address", "role", "store_rating"];
    const allowedDirections = ["asc", "desc"];
    const sortBy = allowedSortFields.includes(sort) ? sort : "name";
    const sortDir = allowedDirections.includes(dir?.toLowerCase()) ? dir.toUpperCase() : "ASC";

    let sortColumn;
    if (sortBy === "role") sortColumn = "r.name";
    else if (sortBy === "store_rating") sortColumn = "COALESCE(sr.avg_store_rating, 0)";
    else sortColumn = `u.${sortBy}`;

    let sql = `
      SELECT u.id, u.name, u.email, u.address, r.name AS role,
        COALESCE(sr.avg_store_rating, 0) AS store_rating
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN (
        SELECT s.owner_id, ROUND(AVG(rt.rating), 2) AS avg_store_rating
        FROM stores s
        LEFT JOIN ratings rt ON s.id = rt.store_id
        GROUP BY s.owner_id
      ) sr ON sr.owner_id = u.id
    `;

    let params = [];
    let filters = [];
    if (name) {
      filters.push("u.name ILIKE $" + (params.length + 1));
      params.push(`%${name}%`);
    }
    if (email) {
      filters.push("u.email ILIKE $" + (params.length + 1));
      params.push(`%${email}%`);
    }
    if (address) {
      filters.push("u.address ILIKE $" + (params.length + 1));
      params.push(`%${address}%`);
    }
    if (role) {
      filters.push("r.name = $" + (params.length + 1));
      params.push(role);
    }
    if (filters.length) sql += " WHERE " + filters.join(" AND ");

    sql += ` ORDER BY ${sortColumn} ${sortDir}`;

    const result = await db.query(sql, params);
    return res.json(new ApiResponse(200, result.rows, "Users fetched"));
  })
);

// adding user for admin only
router.post(
  "/users",
  authMiddleware([1]),
  asyncHandler(async (req, res) => {
    const { name, email, password, address, role } = req.body;

    if (!name || name.length < 20 || name.length > 60) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Name must be between 20 and 60 characters"));
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json(new ApiResponse(400, null, "Valid email is required"));
    }
    if (address && address.length > 400) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Address must not exceed 400 characters"));
    }
    if (!password) {
      return res.status(400).json(new ApiResponse(400, null, "Password is required"));
    }
    if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(password)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Password must be 8-16 characters, include 1 uppercase letter and 1 special character"
          )
        );
    }

    // Get role id from role name
    const roleRow = await db.query("SELECT id FROM roles WHERE name = $1", [role]);
    if (!roleRow.rows.length)
      return res.status(400).json(new ApiResponse(400, null, "Role not found"));

    // Check if email exists
    const exists = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (exists.rows.length)
      return res.status(400).json(new ApiResponse(400, null, "Email already registered"));

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role_id`,
      [name, email, address, hash, roleRow.rows[0].id]
    );
    return res.status(201).json(new ApiResponse(201, result.rows[0], "User created"));
  })
);

// dashboard for admin
router.get(
  "/dashboard",
  authMiddleware([1]),
  asyncHandler(async (req, res) => {
    const users = await db.query("SELECT COUNT(*) FROM users");
    const stores = await db.query("SELECT COUNT(*) FROM stores");
    const ratings = await db.query("SELECT COUNT(*) FROM ratings");
    return res.json(
      new ApiResponse(
        200,
        {
          users: Number(users.rows[0].count),
          stores: Number(stores.rows[0].count),
          ratings: Number(ratings.rows[0].count),
        },
        "Dashboard data"
      )
    );
  })
);

export default router;
