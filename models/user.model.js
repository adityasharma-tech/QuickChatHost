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
    avatar_id: {
      type: String,
      default: "https://i.pravatar.cc/150?uid=random",
    },
    created: Boolean,
    phone_number: {
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
    collection: 'userdata'
  }
);


export const userdata =
  mongoose.model("userdata", userdataSchema) || mongoose.models.userdata;