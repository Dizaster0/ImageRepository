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
        cb(null, file.originalname);
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

router.get('/:imageId', checkAuth, (req, res, next) => {
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

router.post('/multiple', checkAuth, upload.array('images', 1000), async (req, res, next) => {
    console.log(req.files);
    let count = 0;
    for (let i = 0; i < req.files.length; i++) {
        const image = new Image({
            _id: new mongoose.Types.ObjectId(),
            name: req.files[i].originalname,
            image: req.files[i].path,
            size: req.files[i].size
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

router.post('/', checkAuth, upload.single('image'), (req, res, next) => {
    console.log(req.file);
    const image = new Image({
        _id:  new mongoose.Types.ObjectId(),
        name: req.file.originalname,
        image: req.file.path,
        size: req.file.size
    });
    image.save()
    .then(result => {
        res.status(201).json({
            message: 'Uploaded Image Successfully',
            uploadedImage: {
                _id: result._id,
                image: result.image,
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

router.delete('/:imageId', checkAuth, async (req,res,next) => {
    const id = req.params.imageId;
    var filepath = "";
    await Image.findById(id).exec().then(
        result => {
            filepath = result.image;
        }
    );
    Image.deleteOne({_id: id}).exec()
    .then(result => {
        const response = {
            message: "Image Deleted"
        }
        fs.unlinkSync(`${process.cwd()}/${filepath}`)
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

router.delete('/', checkAuth, (req, res, next) => {
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