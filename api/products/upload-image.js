/**
 * Product Image Upload API
 * POST /api/products/upload-image - Upload image to Supabase Storage (admin only)
 */

import { verifyAdmin } from '../_lib/auth-middleware.js';
import { getSupabase } from '../_lib/supabase-admin.js';
import formidable from 'formidable';

const STORAGE_BUCKET = 'product-images';

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Parse multipart form data
 */
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Verify admin authentication
    const adminUser = await verifyAdmin(req);
    if (!adminUser) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Admin access required',
      });
    }

    // Parse form data
    const { fields, files } = await parseForm(req);
    // Formidable v3 returns arrays for file fields
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (imageFile.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 5MB limit.',
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = imageFile.originalFilename.split('.').pop();
    const filename = `products/${timestamp}-${randomStr}.${extension}`;

    // Upload file to Supabase Storage
    const supabase = getSupabase();
    const bucket = supabase.storage.from(STORAGE_BUCKET);
    const fs = await import('fs');
    const fileBuffer = fs.readFileSync(imageFile.filepath);

    const { error: upErr } = await bucket.upload(filename, fileBuffer, {
      contentType: imageFile.mimetype,
      upsert: true,
    });
    if (upErr) throw new Error(upErr.message);

    // Get public URL
    const { data: { publicUrl } } = bucket.getPublicUrl(filename);

    console.log(`✅ Image uploaded: ${filename}`);

    return res.status(200).json({
      success: true,
      imageUrl: publicUrl,
      filename,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image',
    });
  }
}
