import { asyncHandler } from "../utils/asyncHandler.js";
import { userdata } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const fetchConversationsBatch = asyncHandler(async (req, res) => {
  const { phoneNumbers } = req.body;

  const results = await userdata.aggregate([
    { $match: { phone_number: { $in: phoneNumbers } } },
    {
      $project: {
        phone_number: 1,
        name: 1,
        avatar_url: 1,
        quotes: 1,
      },
    },
  ]);
  return res.status(200).json(new ApiResponse(200, results));
});

export { fetchConversationsBatch };
