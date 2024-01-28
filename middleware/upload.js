const path = require('path');
const express = require('express');
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    },
});
var upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, callback) {
        if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'|| file.mimetype ==='application/pdf') {
            callback(null, true)
        } else {        
            console.log('only jpg & png file supported!')
            callback(null, false)
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 2
    }
});  
module.exports = upload;