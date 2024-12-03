import multer from "multer";
// code copied from multer npm
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/temp");
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);// random name generator;
    callback(null, file.fieldname + "-" + uniqueSuffix);
  },
});

export const upload = multer({storage});
