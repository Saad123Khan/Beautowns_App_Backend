import path, {dirname, join} from "path";
import {fileURLToPath} from "url";
import multer from "multer";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const UPLOAD_PATH = join(__dirname, '../', './uploads');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, UPLOAD_PATH);
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const multerUpload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkImageType(req, file, cb)
    },
});

const checkImageType = (req, file, cb) => {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
      return cb(null, true);
  } else {
      req.uploadError = 'Upload file type should be jpg, jpeg, png'
      cb(null, false);
  }
};



export {multerUpload}
