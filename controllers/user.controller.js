import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";
import jwt from 'jsonwebtoken'

const sendOtp = asyncHandler(async (req, res) => {
  if (!req.body.phone_number) {
    throw new ApiError(400, "phone_number is a required field");
  }
  const options = {
    method: "POST",
    url: process.env.MSG91_ENDPOINT + "/otp",
    params: {
      mobile: req.body.phone_number,
      authkey: process.env.MSG91_AUTHKEY,
      realTimeResponse: "1",
    },
    headers: { "Content-Type": "application/JSON" },
  };
  const { data } = await axios.request(options);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        request_id: data.request_id,
      },
      "Account created successfully."
    )
  );
});

const authenticate = asyncHandler(async (req, res) => {
  const { phone_number, otp } = req.body;
  if (!phone_number || !otp)
    throw new ApiError(400, "ALl fields are required.");

  const options = {
    method: "GET",
    url: `${process.env.MSG91_ENDPOINT}/otp/verify`,
    params: { otp, mobile: phone_number },
    headers: { authkey: process.env.MSG91_AUTHKEY },
  };

  const { data } = await axios.request(options);
  if (data["type"] == "error") throw new ApiError(400, data.message);

  if(data["type"] == "success"){
    const token = jwt.sign({
      phone_number
    }, process.env.JWT_SECRET, {
      expiresIn: '10d'
    })
    return res.status(200).json(
      new ApiResponse(200, {
        accessToken: token,
        refreshToken: ''
      }, "login success")
    )
  }
});

export { sendOtp, authenticate };
