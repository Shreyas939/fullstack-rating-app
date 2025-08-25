import express from "express";
import db from "../db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// filtering on stores
router.get(
  "/",
  authMiddleware(), // any authenticated user
  asyncHandler(async (req, res) => {
    const { name, address, sort = "name", dir = "asc" } = req.query;
    const userId = req.user.id;

    const allowedSortFields = ["name", "email", "address"];
    const allowedDirections = ["asc", "desc"];
    const sortBy = allowedSortFields.includes(sort) ? sort : "name";
    const sortDir = allowedDirections.includes(dir.toLowerCase()) ? dir.toUpperCase() : "ASC";

    let sql = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id,
             u.name AS owner_name, u.email AS owner_email,
             COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const params = [];
    const filters = [];

    if (name) {
      filters.push(`s.name ILIKE $${params.length + 1}`);
      params.push(`%${name}%`);
    }
    if (address) {
      filters.push(`s.address ILIKE $${params.length + 1}`);
      params.push(`%${address}%`);
    }
    if (filters.length) {
      sql += ` WHERE ` + filters.join(" AND ");
    }

    sql += ` GROUP BY s.id, u.name, u.email ORDER BY s.${sortBy} ${sortDir}`;

    const storesRes = await db.query(sql, params);

    const storeIds = storesRes.rows.map((store) => store.id);
    let userRatings = [];
    if (storeIds.length > 0) {
      const ratingsRes = await db.query(
        `SELECT store_id, rating FROM ratings WHERE user_id=$1 AND store_id = ANY($2)`,
        [userId, storeIds]
      );
      userRatings = ratingsRes.rows;
    }

    const storesWithUserRating = storesRes.rows.map((store) => {
      const userRatingObj = userRatings.find((ur) => ur.store_id === store.id);
      return {
        ...store,
        user_rating: userRatingObj ? userRatingObj.rating : null,
      };
    });

    return res.json(new ApiResponse(200, storesWithUserRating, "Stores fetched"));
  })
);

// store creation only for admin
router.post(
  "/",
  authMiddleware([1]), // system_admin only
  asyncHandler(async (req, res) => {
    const { name, email, address, owner_id } = req.body;

    if (!name || name.length < 1) {
      throw new ApiError(400, "Store name is required");
    }

    if (owner_id) {
      const ownerRes = await db.query(
        "SELECT id FROM users WHERE id = $1 AND role_id = 3", // 3 = store_owner role
        [owner_id]
      );
      if (ownerRes.rows.length === 0) {
        throw new ApiError(400, "Invalid or non-store-owner owner_id");
      }
    }

    const result = await db.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, address, owner_id || null]
    );

    return res.status(201).json(new ApiResponse(201, result.rows[0], "Store created"));
  })
);

export default router;
