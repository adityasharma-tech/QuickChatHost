// middleware/errorHandler.js
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  }

  // Handle other types of errors (e.g., server errors)
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [err.message],
  });
};

export { errorHandler };
