const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const imageService = require('../services/imageService');
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

/**
 * Handles GET requests to the 'images/' endpoint.
 * Returns a JSON document of all images linked to the User.
 */
router.get('/', checkAuth, imageService.get_all_images);

/**
 * Handles GET requests to the images/:imageId endpoint.
 * Returns a JSON document of the image with the provided image id.
 */
router.get('/:imageId', checkAuth, imageService.get_image_by_id);

/**
 * Handles POST request to 'images/' route.
 * Allows a User to upload one or more images.
 */
router.post('/', checkAuth, upload.array('images', 1000), imageService.upload_images);

/**
 * Handles DELETE requests to the 'images/:imageid' endpoint.
 * Deletes an image based on id.
 */
router.delete('/:imageId', checkAuth, imageService.delete_image_by_id);

/**
 * Handles DELETE requests to the 'images/' endpoint.
 * Deletes all of the User's images. 
 */
router.delete('/', checkAuth, imageService.delete_all_images);

module.exports = router;