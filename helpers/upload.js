const multer = require("multer");
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, hash)=> {
      if(err) cb(err);

      const fileName = `${hash.toString('hex')}-${file.originalname}`;
      cb(null, fileName);
    })
    cb(null, file.originalname);
  },
  
  
});
  const limits = function(req, file, cb) {
    fileSize: 120 * 2;
  }
  
  const fileFilter = ( req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif'
    ];
    if(allowedMimes.includes(file.mimetype)){
      cb(null, true);
    } else {
      cb(new Error('Arquivo do tipo inválido'));
    }
  }
  

module.exports = multer({ storage:storage, limits, fileFilter: fileFilter });
