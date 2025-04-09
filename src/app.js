import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import HTTP_STATUS_CODES from "./utils/httpStatusCodes.js";
import { ApiError } from "./utils/apiError.js";
import globalErrorHandler from "./utils/globleErrorHandler.js";
import router from "./routes/index.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use("/api/v1", router);

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(
    new ApiError(
      HTTP_STATUS_CODES.NOT_FOUND.code,
      `No such route found for ${req.method} ${req.originalUrl}`
    )
  );
});

// Global Error Handler
app.use(globalErrorHandler);

export { app };
