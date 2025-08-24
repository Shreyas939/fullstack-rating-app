import express from "express";
import db from "../db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get list of users who rated the store owned by current store owner
router.get(
  "/ratings",
  authMiddleware([3]), // store_owner role
  asyncHandler(async (req, res) => {
    const storeOwnerId = req.user.id;

    // Find stores owned by the user
    const storesRes = await db.query(
      "SELECT id FROM stores WHERE owner_id = $1",
      [storeOwnerId]
    );

    if (!storesRes.rows.length) {
      return res.json(new ApiResponse(200, [], "No stores found"));
    }

    const storeIds = storesRes.rows.map((row) => row.id);

    const ratingsRes = await db.query(
      `SELECT r.id, r.rating, r.created_at, u.name as user_name, r.store_id
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ANY($1)
       ORDER BY r.created_at DESC`,
      [storeIds]
    );

    return res.json(
      new ApiResponse(200, ratingsRes.rows, "Users who rated your store")
    );
  })
);

// Get average rating of store(s) owned by current store owner
router.get(
  "/average-rating",
  authMiddleware([3]),
  asyncHandler(async (req, res) => {
    const storeOwnerId = req.user.id;

    const storesRes = await db.query(
      "SELECT id FROM stores WHERE owner_id = $1",
      [storeOwnerId]
    );

    if (!storesRes.rows.length) {
      return res.json(new ApiResponse(200, null, "No stores found"));
    }

    const storeIds = storesRes.rows.map((row) => row.id);

    const avgRatingRes = await db.query(
      `SELECT ROUND(AVG(rating), 2) as average_rating
       FROM ratings 
       WHERE store_id = ANY($1)`,
      [storeIds]
    );

    return res.json(
      new ApiResponse(200, avgRatingRes.rows[0], "Average store rating")
    );
  })
);

export default router;
