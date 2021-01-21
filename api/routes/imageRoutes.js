const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const checkAuth = require('../middleware/check-auth');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, req.userData.username + '_' + file.originalname);
    }
});
const filter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 50
    },
    fileFilter: filter
});
const Image = require('../models/image');

router.get('/', checkAuth, (req, res, next) => {
    Image.find({userId: req.userData.userId})
    .select('name _id userId image')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            images: docs
        }
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:imageId', checkAuth, (req, res, next) => {
    const imageId = req.params.imageId;
    Image.find({_id: imageId, userId: req.userData.userId})
    .select('_id name image')
    .exec()
    .then(doc => {
        if (doc) {
            res.status(200).json(doc);
        } else {
            res.status(404).json({
                message: 'No valid entry found for provided ID'
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({err: err.message});
    });
});

router.post('/multiple', checkAuth, upload.array('images', 1000), (req, res, next) => {
    let count = 0;
    for (let i = 0; i < req.files.length; i++) {
        const image = new Image({
            _id: new mongoose.Types.ObjectId(),
            userId: req.userData.userId,
            name: req.userData.username + '_' + req.files[i].originalname,
            size: req.files[i].size
        });
        image.save().then( result => {
            count++;
            console.log("Uploaded " + count + " of " + req.files.length + " images.")
        }).catch(
            err => {
                console.log(err);
            }
        )
    }
    if (count === req.files.length) {
        res.status(201).json({
            message: 'Uploaded Images Successfully',  
        });
    } else {
        res.status(500).json({
            message: 'Something went wrong when uploading multiple files'
        });
    }
});

router.post('/', checkAuth, upload.single('image'), (req, res, next) => {
    const image = new Image({
        _id:  new mongoose.Types.ObjectId(),
        userId: req.userData.userId,
        name: req.userData.username + '_' + req.file.originalname,
        size: req.file.size
    });
    image.save()
    .then(result => {
        res.status(201).json({
            message: 'Uploaded Image Successfully',
            uploadedImage: {
                _id: result._id,
                userId: result.userId,
                size: result.size,
                request: {
                    method: 'GET',
                    url: 'http://localhost:3000/images/' + result._id
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.delete('/:imageId', checkAuth, (req,res,next) => {
    const id = req.params.imageId;
    Image.find({_id: id, userId: req.userData.userId}).exec().then(
        result => {
            if (result.length > 0) {
                    Image.deleteOne({_id: result[0]._id}).exec()
                    .then(result => {
                        const response = {
                            message: "Image Deleted"
                        }
                        fs.unlinkSync(`${process.cwd()}/uploads/${filename}`)
                        res.status(200).json(response);
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        })
                    });
            } else {
                res.status(500).json({
                    message: "No image was found with the provided id."
                });
            }
        }
    );

});

router.delete('/', checkAuth, (req, res, next) => {
    Image.find({userId: req.userData.userId}).exec().then(
        result => {
            if (result.length > 0) {
                Image.deleteMany({userId: req.userData.userId}).exec()
                .then(mongoResult => {
                    const dir = `${process.cwd()}/uploads`;
                    fs.readdir(dir, (err, files) => {
                        if (err) throw err;
                        for (let i = 0; i < result.length; i++) {
                            fs.unlink(path.join(dir, result[i].name), err => {
                                if (err) throw err;
                            })
                        }
                    });
                    const response = {
                        message: "Images Deleted"
                    }
                    res.status(200).json(response);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    })
                });
            } else {
                res.status(500).json({
                    message: "No Images to be Deleted"
                })
            }
        }
    )

})

module.exports = router;