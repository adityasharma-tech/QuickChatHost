import { ApiResponse } from "../utils/ApiResponse"
import { asyncHandler } from "../utils/asyncHandler"

const sendMessageViaNotification = asyncHandler(async (req, res) => {
    

    return res.status(200).json(
        new ApiResponse(200, {}, "Message sent successfully"),
    )
})

export {
    sendMessageViaNotification
}