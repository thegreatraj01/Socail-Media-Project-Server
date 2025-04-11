import { ApiResponse } from "./ApiResponse.js";

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      // Use ApiResponse for error
      process.env.NODE_ENV = "development" && console.log("err", err);
      const statusCode = err.statusCode || 500;
      const response = new ApiResponse(statusCode, null, err.message);
      res.status(statusCode).json(response);
    });
  };
};

export { asyncHandler };
