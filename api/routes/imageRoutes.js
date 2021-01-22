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

/**
 * Handles GET request to the 'images/' endpoint.
 * Returns a JSON document of all images linked to the User.
 */
router.get('/', checkAuth, (req, res) => {
    Image.find({userId: req.userData.userId})
    .select('name _id userId image').exec()
    .then(docs => {
        const response = {
            count: docs.length,
            images: docs
        }
        res.status(200).json(response);
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

/**
 * Handles GET requests to the images/:imageId endpoint.
 * Returns a JSON document of the image with the provided image id.
 */
router.get('/:imageId', checkAuth, (req, res) => {
    const imageId = req.params.imageId;
    Image.find({_id: imageId, userId: req.userData.userId})
    .select('_id name size').exec()
    .then( doc => {
        if (doc) {
            res.status(200).json(doc);
        } else {
            res.status(400).json({
                message: 'No Images were found with the given Image ID'
            });
        }
    }).catch(err => {
        res.status(500).json({err: err.message});
    });
});

/**
 * Handles POST request to 'upload/multiple' route.
 * Allows a User to upload multiple images.
 */
router.post('/multiple', checkAuth, upload.array('images', 1000), async (req, res, next) => {
    if (req.files == undefined || req.files.length == 0) {
        res.status(400).json({
            message: "Please select one or more .jpg/.png images for upload and try again."
        });
    } else {
        let count = 0;
        let filesToUpload = req.files.length;
        for (let i = 0; i < req.files.length; i++) {
            let imageName = req.userData.username + '_' + req.files[i].originalname;
            const image = new Image({
                _id: new mongoose.Types.ObjectId(),
                userId: req.userData.userId,
                name: imageName,
                size: req.files[i].size
            });
            let imageExists = await Image.find({name: imageName}).exec();
            if (imageExists.length === 0) {
                await image.save().then(
                ignored => {
                    count++;
                });
            } else {
                console.log(`Skipping upload of ${req.files[i].originalname} since it already exists in your database.`);
                filesToUpload--;
            }
        }
        if (count === filesToUpload) {
            res.status(201).json({
                message: `Uploaded ${count} Images Successfully`,  
            });
        } else {
            res.status(500).json({
                message: 'Something went wrong when uploading your images.'
            });
        }
    }
});

/**
 * Handles POST request for the 'images/' endpoint.
 * Allows a User to upload a single image.
 */
router.post('/', checkAuth, upload.single('image'), async (req, res) => {
    if (req.file == undefined) {
        res.status(400).json({
            message: 'Please select a single .jpg/.png image for upload and try again.'
        })
    } else {
        let imageName = req.userData.username + '_' + req.file.originalname;
        const image = new Image({
            _id:  new mongoose.Types.ObjectId(),
            userId: req.userData.userId,
            name: req.userData.username + '_' + req.file.originalname,
            size: req.file.size
        });
        let fileExists = await Image.find({name: imageName}).exec();
        if (fileExists.length >= 1) {
            res.status(500).json({
                message: `The image ${req.file.originalname} already exists in your database.`
            });
        } else {
            image.save().then(
                result => {
                    res.status(201).json({
                        message: 'Uploaded Image Successfully',
                        uploadedImage: {
                            _id: result._id,
                            userId: result.userId,
                            name: result.name,
                            size: result.size
                    }});
            }).catch(err => {
                res.status(500).json({
                    error: err
                });
            });
        }
    }
});

/**
 * Handles DELETE requests to the 'images/:imageid' endpoint.
 * Deletes an image based on id.
 */
router.delete('/:imageId', checkAuth, (req,res) => {
    const id = req.params.imageId;
    Image.find({_id: id, userId: req.userData.userId}).exec().then(
        result => {
            if (result.length > 0) {
                    Image.deleteOne({_id: result[0]._id}).exec().then(
                        ignored => {
                            let filename = result[0].name;
                            const response = {
                                message: `${filename} deleted.`
                            }
                            fs.unlinkSync(`${process.cwd()}/uploads/${filename}`)
                            res.status(200).json(response);
                    }).catch(
                        err => {
                            res.status(500).json({
                                error: err
                            })
                        }
                    );
            } else {
                res.status(400).json({
                    message: "Please enter a valid Image ID."
                });
            }
        }
    );

});

/**
 * Handles DELETE requests to the 'images/' endpoint.
 * Deletes all of the User's images. 
 */
router.delete('/', checkAuth, (req, res) => {
    Image.find({userId: req.userData.userId}).exec().then(
        result => {
            if (result.length > 0) {
                Image.deleteMany({userId: req.userData.userId}).exec().then(
                    ignored => {
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
                            message: "All images have been deleted from your database."
                        }
                        res.status(200).json(response);
                }).catch(
                    err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        })
                    }
                );
            } else {
                res.status(200).json({
                    message: "There are no Images left to delete in your database."
                });
            }
        });
});

module.exports = router;