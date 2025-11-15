// backend/routes/product.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const cloudinary = require('../config/cloudinary');
const { productUpload } = require('../middleware/upload');

// CREATE - Add New Product
router.post('/', productUpload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    // Upload images to Cloudinary (handled by multer-storage-cloudinary)
    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      images
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// READ - Get All Products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// READ - Get Single Product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// UPDATE - Edit Product
router.put('/:id', productUpload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, stock, category, existingImages } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Parse existing images
    let updatedImages = [];
    if (existingImages) {
      try {
        updatedImages = JSON.parse(existingImages);
      } catch (parseError) {
        console.error('Error parsing existingImages:', parseError);
        updatedImages = [];
      }
    }

    // Delete removed images from Cloudinary
    const removedImages = product.images.filter(
      img => !updatedImages.find(existImg => existImg.publicId === img.publicId)
    );

    for (let img of removedImages) {
      try {
        await cloudinary.uploader.destroy(img.publicId);
        console.log(`Deleted image from Cloudinary: ${img.publicId}`);
      } catch (cloudinaryError) {
        console.error(`Failed to delete image ${img.publicId}:`, cloudinaryError);
      }
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
      updatedImages = [...updatedImages, ...newImages];
    }

    // Update product fields
    product.name = name;
    product.description = description;
    product.price = price;
    product.stock = stock;
    product.category = category;
    product.images = updatedImages;

    await product.save();
    res.json({ message: 'Product updated successfully', product });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// DELETE - Remove Product
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate ObjectId format
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete all images from Cloudinary
    let deletedImagesCount = 0;
    let failedImagesCount = 0;

    for (let img of product.images) {
      try {
        const result = await cloudinary.uploader.destroy(img.publicId);
        if (result.result === 'ok' || result.result === 'not found') {
          deletedImagesCount++;
          console.log(`Successfully deleted image: ${img.publicId}`);
        } else {
          failedImagesCount++;
          console.warn(`Failed to delete image: ${img.publicId}`, result);
        }
      } catch (cloudinaryError) {
        failedImagesCount++;
        console.error(`Error deleting image ${img.publicId}:`, cloudinaryError);
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(productId);

    res.json({ 
      message: 'Product deleted successfully',
      details: {
        productId: productId,
        productName: product.name,
        totalImages: product.images.length,
        deletedImages: deletedImagesCount,
        failedImages: failedImagesCount
      }
    });

    console.log(`Product ${product.name} (${productId}) deleted successfully`);

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      message: 'Error deleting product', 
      error: error.message 
    });
  }
});

module.exports = router;
