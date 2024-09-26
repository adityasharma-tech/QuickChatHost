import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const userdataSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quotes: {
      type: String,
      requried: false,
      trim: true,
    },
    user_id: {
      type: String,
      required: false,
    },
    avatar_url: {
      type: String,
      default: "https://i.pravatar.cc/150?uid=random",
    },
    created: Boolean,
    phone_number: {
      type: String,
      trim: true,
      required: true,
    },
    fcm_token: {
      type: String,
      requried: false,
    },
  },
  {
    timestamps: true,
    collection: "userdata",
  }
);

userdataSchema.plugin(mongooseAggregatePaginate);
export const userdata =
  mongoose.model("userdata", userdataSchema) || mongoose.models.userdata;
