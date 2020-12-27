const express = require('express');
const router = express.Router();

/**
 * Gets all images from the server.
 */
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /images'
    });
});

/**
 * Uploads a single image to the server.
 */
router.post('/', (req, res, next) => {
    res.status(201).json({
        message: 'Handling POST requests to /images'
    });
});

/**
 * Gets a single image from the server based on the filename.
 */
router.get('/:filename', (req, res, next) => {
    const filename = req.params.filename;
    if (filename === 'nezuko') {
        res.status(200).json({
            message: 'Retrieved image Nezuko',
            id: filename
        });
    } else {
        res.status(200).json({
            message: 'You passed a filename'
        });
    }
});

/**
 * Deletes an image from the sever based on the filename.
 */
router.delete('/:filename', (req,res,next) => {
    const filename = req.params.filename;
    if (filename === 'nezuko') {
        res.status(200).json({
            message: 'Deleted image nezuko',
            id: filename
        });
    } else {
        res.status(200).json({
            message: 'Failed to delete image',
            id: filename
        });
    }
});

module.exports = router;