import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log('Destination function called');
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      console.log('Filename function called');
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})