import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    return res.status(400).json(new ApiError(400, "Avatar file is missing"))
  }

  // TODO: delete old image

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    return res.status(400).json(new ApiError(400, "Error while uploading on avatar"));
  }

  const user = await User.findByIdAndUpdate(
    {
      phone_number: req.user.phone_number,
    },
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const authenticate = asyncHandler(async (req, res) => {
  const { verification_token } = req.body;
  if (!verification_token)
    return res.status(400).json(new ApiError(400, "verification_token is required."));

  console.log("@authentication.verification_token:", verification_token);

  const { data } = await axios.post(
    `${process.env.MSG91_ENDPOINT}/widget/verifyAccessToken`,
    {
      authkey: process.env.MSG91_AUTH_KEY,
      "access-token": verification_token,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  console.log(data);

  if (data["type"] == "success") {
    const token = jwt.sign(
      {
        aud: "user",
        sub: data.message,
        type: "normal",
        user_data: {
          phone_number: data.message,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        algorithm: "HS256",
      }
    );
    console.log("@authentication.token:", token, process.env.ACCESS_TOKEN_SECRET);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          access_token: token,
        },
        "login success"
      )
    );
  } else {
    return res.status(400).json(
      new ApiError(400, data.message)
    )
  }
});

export { authenticate, updateUserAvatar };
