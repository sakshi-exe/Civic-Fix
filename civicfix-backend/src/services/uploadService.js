const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

class UploadService {
  async uploadToCloudinary(filePath, folder = 'civicfix') {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return `/uploads/${path.basename(filePath)}`;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
    });

    fs.unlinkSync(filePath);

    return result.secure_url;
  }
}

module.exports = new UploadService();
