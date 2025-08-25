import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  // default fallback
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal Server Error",
  });
};

export default errorHandler;
