import { Contacts } from "../models/contacts.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const saveContacts = asyncHandler(async (req, res) => {

    const data = req.body;

    const constacts = await Contacts.create({
        phoneNumber: data.phoneNumber,
        contacts: data.contacts
    })

    console.log("Saved")

    await constacts.save()
    
      return res.status(200).json(
        new ApiResponse(200, "success")
      )
  });
  
  export { saveContacts };