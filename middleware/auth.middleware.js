import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decodedData
        next()
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid access token");
    }
})