import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import HTTP_STATUS_CODE from "../utils/httpStatusCodes.js";

// DONE :
const healthcheck = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODE.OK.code,
        { status: "OK" },
        "Healthcheck passed successfully"
      )
    );
});

export { healthcheck };
