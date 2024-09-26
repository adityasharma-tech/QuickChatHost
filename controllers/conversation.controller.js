import { asyncHandler } from "../utils/asyncHandler.js";
import { userdata } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const fetchConversationsBatch = asyncHandler(async (req, res) => {
  const { conversations } = req.body;

  const phoneNumbers = conversations.map(conversation => conversation.phoneNumber);

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

  const enrichedResults = results.map(result => {
    const conversation = conversations.find(convo => convo.phoneNumber === result.phone_number);
    return {
      ...result,
      conversationId: conversation.conversationId
    };
  });

  return res.status(200).json(
    new ApiResponse(200, enrichedResults)
  );
});

export { fetchConversationsBatch };
