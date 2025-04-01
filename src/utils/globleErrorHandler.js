import { ApiError } from "./apiError.js";
import { ApiResponse } from "./ApiResponse.js";

// 🔹 Global Error Middleware
const globalErrorHandler = (err, req, res, next) => {
    // If error is not an instance of ApiError, create a generic one
    if (!(err instanceof ApiError)) {
        err = new ApiError(500, "Internal Server Error");
    }

    // 🔹 Standardized API Response
    const response = new ApiResponse(err.statusCode, null, err.message);
    return res.status(err.statusCode).json(response);
};

export default globalErrorHandler;
