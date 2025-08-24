import express from "express";
import db from "../db.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/ratings/:storeId
 * Body: { rating, comment }
 * Requires: logged-in user
 */
router.post(
  "/:storeId",
  authMiddleware(),
  asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Rating must be between 1 and 5"));
    }

    // ✅ UPSERT: if a rating exists, update it; else insert new
    const result = await db.query(
      `INSERT INTO ratings (store_id, user_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = EXCLUDED.rating, created_at = CURRENT_TIMESTAMP
       RETURNING id, store_id, user_id, rating, created_at`,
      [storeId, userId, rating]
    );

    return res
      .status(201)
      .json(new ApiResponse(201, result.rows[0], "Rating saved/updated"));
  })
);

/**
 * GET /api/ratings/:storeId
 * Returns average rating + all reviews
 */
router.get(
  "/:storeId",
  asyncHandler(async (req, res) => {
    const { storeId } = req.params;

    const avgRes = await db.query(
      "SELECT ROUND(AVG(rating),2) as avg_rating, COUNT(*) as total_reviews FROM ratings WHERE store_id=$1",
      [storeId]
    );

    const reviewsRes = await db.query(
      `SELECT r.id, r.rating, r.created_at, u.name as user_name
       FROM ratings r
       JOIN users u ON r.user_id=u.id
       WHERE r.store_id=$1
       ORDER BY r.created_at DESC`,
      [storeId]
    );

    return res.json(
      new ApiResponse(200, {
        average: avgRes.rows[0],
        reviews: reviewsRes.rows,
      },
      "Ratings fetched")
    );
  })
);


/**
 * POST or UPDATE rating for a store
 */
router.post(
  "/:storeId",
  authMiddleware(),
  asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Rating must be between 1 and 5"));
    }

    // Upsert: if exists → update, else → insert
    const result = await db.query(
      `INSERT INTO ratings (store_id, user_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = EXCLUDED.rating, created_at = CURRENT_TIMESTAMP
       RETURNING id, store_id, user_id, rating, created_at`,
      [storeId, userId, rating]
    );

    return res
      .status(201)
      .json(new ApiResponse(201, result.rows[0], "Rating saved/updated"));
  })
);


export default router;
