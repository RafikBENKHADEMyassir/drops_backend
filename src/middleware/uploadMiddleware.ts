// import multer from "multer";
// import path from "path";

// // ✅ Storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../../uploads")); // Files saved to /uploads
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, `${uniqueSuffix}-${file.originalname}`);
//   },
// });

// // ✅ File filter (optional, to restrict file types)
// const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only images are allowed!"), false);
//   }
// };
// export const formParser = multer().none();
// // ✅ Multer upload configuration
// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5 MB file size limit
//   },
// });

import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// For file uploads
// export const upload = multer({ storage });

// For form data without files
export const dropUpload = multer({ storage }).fields([
  { name: 'content', maxCount: 1 },
  { name: 'type', maxCount: 1 },
  { name: 'title', maxCount: 1 },
  { name: 'location', maxCount: 1 },
]);

