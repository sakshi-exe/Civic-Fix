const uploadService = require('../services/uploadService');
const { successResponse } = require('../utils/response');

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        errors: ['Please select an image to upload'],
      });
    }

    const imageUrl = await uploadService.uploadToCloudinary(req.file.path);

    return successResponse(res, 'Image uploaded successfully', { imageUrl }, 201);
  } catch (error) {
    next(error);
  }
};
