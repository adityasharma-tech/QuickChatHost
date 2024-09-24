import mongoose from "mongoose";

const contactsSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
    },
    contacts: [
      {
        contactName: String,
        phoneNumber: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Contacts =
  mongoose.model("Contact", contactsSchema) || mongoose.models.Contact;
