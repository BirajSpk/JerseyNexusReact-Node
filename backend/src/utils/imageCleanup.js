const { prisma } = require('../config/database');
const { deleteFromCloudinaryByUrl, cloudinary } = require('./cloudinary');

/**
 * Clean up orphaned images from Cloudinary
 * This function finds images in Cloudinary that are no longer referenced in the database
 */
async function cleanupOrphanedImages() {
  try {
    console.log('Starting orphaned image cleanup...');
    
    // Get all Cloudinary images in our folders
    const cloudinaryImages = [];
    
    // Get product images from Cloudinary
    try {
      const productImagesResult = await cloudinary.search
        .expression(`folder:${process.env.CLOUDINARY_BASE_FOLDER || 'jerseynexus'}/products/*`)
        .sort_by([['created_at', 'desc']])
        .max_results(500)
        .execute();
      
      cloudinaryImages.push(...productImagesResult.resources);
    } catch (error) {
      console.error('Error fetching product images from Cloudinary:', error);
    }

    // Get blog images from Cloudinary
    try {
      const blogImagesResult = await cloudinary.search
        .expression(`folder:${process.env.CLOUDINARY_BASE_FOLDER || 'jerseynexus'}/blogs`)
        .sort_by([['created_at', 'desc']])
        .max_results(500)
        .execute();
      
      cloudinaryImages.push(...blogImagesResult.resources);
    } catch (error) {
      console.error('Error fetching blog images from Cloudinary:', error);
    }

    // Get profile images from Cloudinary
    try {
      const profileImagesResult = await cloudinary.search
        .expression(`folder:${process.env.CLOUDINARY_BASE_FOLDER || 'jerseynexus'}/profiles/*`)
        .sort_by([['created_at', 'desc']])
        .max_results(500)
        .execute();
      
      cloudinaryImages.push(...profileImagesResult.resources);
    } catch (error) {
      console.error('Error fetching profile images from Cloudinary:', error);
    }

    console.log(`Found ${cloudinaryImages.length} images in Cloudinary`);

    // Get all image URLs from database
    const dbImageUrls = new Set();

    // Get product images from database
    const productImages = await prisma.productImage.findMany({
      select: { url: true }
    });
    productImages.forEach(img => dbImageUrls.add(img.url));

    // Get blog featured images from database
    const blogs = await prisma.blog.findMany({
      select: { featuredImage: true, images: true }
    });
    
    blogs.forEach(blog => {
      if (blog.featuredImage) {
        dbImageUrls.add(blog.featuredImage);
      }
      
      // Parse blog content images
      if (blog.images) {
        try {
          const imageArray = typeof blog.images === 'string' ? JSON.parse(blog.images) : blog.images;
          if (Array.isArray(imageArray)) {
            imageArray.forEach(img => {
              if (img.url) dbImageUrls.add(img.url);
            });
          }
        } catch (parseError) {
          console.warn('Failed to parse blog images:', parseError);
        }
      }
    });

    // Get user profile images from database
    const users = await prisma.user.findMany({
      select: { avatar: true }
    });
    users.forEach(user => {
      if (user.avatar) dbImageUrls.add(user.avatar);
    });

    console.log(`Found ${dbImageUrls.size} image URLs in database`);

    // Find orphaned images
    const orphanedImages = cloudinaryImages.filter(cloudinaryImg => {
      return !dbImageUrls.has(cloudinaryImg.secure_url);
    });

    console.log(`Found ${orphanedImages.length} orphaned images`);

    // Delete orphaned images
    const deletionResults = [];
    for (const orphanedImg of orphanedImages) {
      try {
        const result = await cloudinary.uploader.destroy(orphanedImg.public_id, {
          resource_type: orphanedImg.resource_type || 'image'
        });
        
        deletionResults.push({
          public_id: orphanedImg.public_id,
          url: orphanedImg.secure_url,
          result: result.result,
          success: result.result === 'ok'
        });
        
        console.log(`Deleted orphaned image: ${orphanedImg.public_id} - ${result.result}`);
      } catch (error) {
        console.error(`Failed to delete orphaned image ${orphanedImg.public_id}:`, error);
        deletionResults.push({
          public_id: orphanedImg.public_id,
          url: orphanedImg.secure_url,
          result: 'error',
          success: false,
          error: error.message
        });
      }
    }

    const successfulDeletions = deletionResults.filter(r => r.success).length;
    const failedDeletions = deletionResults.filter(r => !r.success).length;

    console.log(`Cleanup completed: ${successfulDeletions} deleted, ${failedDeletions} failed`);

    return {
      total_cloudinary_images: cloudinaryImages.length,
      total_db_images: dbImageUrls.size,
      orphaned_found: orphanedImages.length,
      successful_deletions: successfulDeletions,
      failed_deletions: failedDeletions,
      deletion_results: deletionResults
    };

  } catch (error) {
    console.error('Error during orphaned image cleanup:', error);
    throw error;
  }
}

/**
 * Clean up images for a specific product
 * @param {string} productId - The product ID
 */
async function cleanupProductImages(productId) {
  try {
    const productImages = await prisma.productImage.findMany({
      where: { productId },
      select: { url: true }
    });

    const deletionResults = [];
    for (const img of productImages) {
      try {
        const result = await deleteFromCloudinaryByUrl(img.url, 'image');
        deletionResults.push({
          url: img.url,
          result: result.result,
          success: result.result === 'ok' || result.result === 'not found'
        });
      } catch (error) {
        console.error(`Failed to delete product image ${img.url}:`, error);
        deletionResults.push({
          url: img.url,
          result: 'error',
          success: false,
          error: error.message
        });
      }
    }

    return deletionResults;
  } catch (error) {
    console.error('Error cleaning up product images:', error);
    throw error;
  }
}

/**
 * Clean up images for a specific blog
 * @param {string} blogId - The blog ID
 */
async function cleanupBlogImages(blogId) {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { featuredImage: true, images: true }
    });

    if (!blog) {
      return { error: 'Blog not found' };
    }

    const deletionResults = [];
    const imagesToDelete = [];

    // Add featured image
    if (blog.featuredImage) {
      imagesToDelete.push(blog.featuredImage);
    }

    // Add content images
    if (blog.images) {
      try {
        const imageArray = typeof blog.images === 'string' ? JSON.parse(blog.images) : blog.images;
        if (Array.isArray(imageArray)) {
          imageArray.forEach(img => {
            if (img.url) imagesToDelete.push(img.url);
          });
        }
      } catch (parseError) {
        console.warn('Failed to parse blog images for cleanup:', parseError);
      }
    }

    // Delete images from Cloudinary
    for (const imageUrl of imagesToDelete) {
      try {
        const result = await deleteFromCloudinaryByUrl(imageUrl, 'image');
        deletionResults.push({
          url: imageUrl,
          result: result.result,
          success: result.result === 'ok' || result.result === 'not found'
        });
      } catch (error) {
        console.error(`Failed to delete blog image ${imageUrl}:`, error);
        deletionResults.push({
          url: imageUrl,
          result: 'error',
          success: false,
          error: error.message
        });
      }
    }

    return deletionResults;
  } catch (error) {
    console.error('Error cleaning up blog images:', error);
    throw error;
  }
}

module.exports = {
  cleanupOrphanedImages,
  cleanupProductImages,
  cleanupBlogImages
};
