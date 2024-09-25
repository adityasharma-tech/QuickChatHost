import mongoose from "mongoose";

const userdataSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user_id: {
      type: String,
      required: false,
    },
    avatarUrl: {
      type: String,
      default: "https://i.pravatar.cc/150?uid=random",
    },
    created: Boolean,
    phoneNumber: {
      type: String,
      trim: true,
      required: true
    },
    fcm_token: {
      type: String,
      requried: false
    }
  },
  {
    timestamps: true,
  }
);


export const userdata =
  mongoose.model("userdata", userdataSchema) || mongoose.models.userdata;