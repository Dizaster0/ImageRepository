const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

// Filter to only accept images
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
 * Returns a JSON array  of all images in the database.
 */
router.get('/', (req, res, next) => {
    Image.find()
    .select('name _id image')
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


/**
 * Returns a single JSON object representing an image from the database.
 */
router.get('/:imageId', (req, res, next) => {
    const imageId = req.params.imageId;
    Image.findById(imageId)
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

/**
 * Uploads bulk images to the database.
 */
router.post('/bulkUpload', upload.array('images', 1000), async (req, res, next) => {
    console.log(req.files);
    let count = 0;
    for (let i = 0; i < req.files.length; i++) {
        const image = new Image({
            _id: new mongoose.Types.ObjectId(),
            name: req.files[i].originalname,
            image: req.files[i].path
        });
        await image.save().then( result => {
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

/**
 * Uploads a single image to the database.
 */
router.post('/', upload.single('image'),(req, res, next) => {
    console.log(req.file);
    const image = new Image({
        _id:  new mongoose.Types.ObjectId(),
        name: req.body.name,
        image: req.file.path
    });
    image.save()
    .then(result => {
        res.status(201).json({
            message: 'Uploaded Image Successfully',
            uploadedImage: {
                name: result.name,
                _id: result._id,
                image: result.image,
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

/**
 * Deletes a single image from the database based on the image id.
 */
router.delete('/:imageId', async (req,res,next) => {
    const id = req.params.imageId;
    var filepath = "";
    await Image.findById(id).exec().then(
        result => {
            filename = result.image;
        }
    );
    console.log(filename);
    Image.deleteOne({_id: id}).exec()
    .then(result => {
        const response = {
            message: "Image Deleted"
        }
        fs.unlinkSync(`${process.cwd()}/${filename}`)
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

/**
 * Deletes all images from the server database.
 */
router.delete('/', (req, res, next) => {
    Image.deleteMany({}).exec()
    .then(result => {
        const response = {
            message: "Images Deleted"
        }
        const dir = `${process.cwd()}/uploads`;
        fs.readdir(dir, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(dir, file), err => {
                    if (err) throw err;
                });
            }
        });
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
})

module.exports = router;