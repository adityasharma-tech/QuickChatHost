import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { userdata } from "../models/user.model.js";

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath, `${req.user.user_data.phone_number}-av`);

  if (!avatar?.secure_url) {
    throw new ApiError(400, "Error while uploading on avatar")
  }

  const user = await userdata.findOneAndUpdate(
    {
      phone_number: req.user.user_data.phone_number,
    },
    {
      $set: {
        avatar_url: avatar.secure_url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const updateUserData = asyncHandler(async (req, res) => {

  const {name, quotes} = req.body;

  if (!(name || quotes)) {
    throw new ApiError(400,"User data is missing");
  }

  const user = await userdata.findOneAndUpdate(
    {
      phone_number: req.user.user_data.phone_number,
    },
    {
      $set: {
        name,
        quotes
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const authenticate = asyncHandler(async (req, res) => {
  const { verification_token } = req.body;
  if (!verification_token)
    throw new ApiError(400, "verification_token is required.")

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
    throw new ApiError(400, data.message);
  }
});

export { authenticate, updateUserAvatar, updateUserData };
