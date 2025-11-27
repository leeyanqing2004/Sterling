'use strict';

const multer = require('multer');
const path = require('path');

// Where to store files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/avatars');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `${req.auth.utorid}${ext}`;
        cb(null, filename);
    }
});

// Only accept image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;