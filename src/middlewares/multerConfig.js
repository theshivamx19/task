import multer from 'multer';



const storage = multer.memoryStorage({})
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, 'image');
//   } else if (file.mimetype === 'application/pdf') {
//     cb(null, 'document');
//   } else {
//     cb(new Error('Invalid file type'), false);
//   }
// };
// var upload = multer({ storage: storage })

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    fieldSize: 5 * 1024 * 1024,
  }
})