const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Image = require('../models/image');

/**
 * Returns a list of all images in the database.
 */
router.get('/', (req, res, next) => {
    Image.find().exec()
    .then(docs => {
        console.log(docs);
        res.status(200).json(docs);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});


/**
 * Returns a single JSON object representing an image from the database.
 */
router.get('/:imageId', (req, res, next) => {
    const imageId = req.params.imageId;
    Image.findById(imageId)
    .exec()
    .then(doc => {
        console.log(doc);
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

/**
 * Uploads a single image to the database.
 */
router.post('/', (req, res, next) => {
    const image = new Image({
        _id:  new mongoose.Types.ObjectId(),
        name: req.body.name
    });
    image.
    save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Handling POST requests to /images',
            uploadedImage: result
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

/**
 * Deletes an image from the sever based on the image id.
 */
router.delete('/:imageId', (req,res,next) => {
    const id = req.params.imageId;
    Image.remove({_id: id}).exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

module.exports = router;