import { ApiError } from "../.temp/src/utils/ApiError"
import { asyncHandler } from "../.temp/src/utils/asyncHandler"
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token){
            throw new ApiError(401, "Unauthorized request") 
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        decodedToken.payload
        next()
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid access token")
    }
})