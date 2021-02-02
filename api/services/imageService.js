const Image = require('../models/image');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');



exports.get_all_images = (req, res, next) => {
    Image.find({userId: req.userData.userId})
    .select('name _id userId size image').exec()
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
}

exports.get_image_by_id = (req, res, next) => {
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
}

exports.upload_images = async (req, res, next) => {
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
                message: count ===  1  ? `Uploaded ${count} image successfully` : `Uploaded ${count} images successfully`
            });
        } else {
            res.status(500).json({
                message: 'Something went wrong when uploading your images.'
            });
        }
    }
}

exports.delete_image_by_id = (req, res, next) => {
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
}

exports.delete_all_images = (req, res, next) => {
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
}