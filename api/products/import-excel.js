/**
 * Excel Import API - Import products from XLSX/XLS file
 *
 * POST /api/products/import-excel - Parse and import Excel file (admin only)
 *
 * Expected Excel format:
 * | name | category | price | stock | description | images | ... |
 *
 * Images column accepts:
 * - Full URLs (https://...)
 * - Filenames (hero.jpg) — resolved via imageMap field
 * - Embedded images in XLSX cells (auto-extracted)
 *
 * Import methods (sent as form field "importMethod"):
 * - "auto"     : Extract embedded images from XLSX, fall back to filename matching
 * - "row-order": Match uploaded images to Excel rows by order (1st image → row 1)
 * - "filename" : Traditional filename matching via imageMap
 */

import { bulkImportProducts } from '../_lib/firestore-service.js';
import { verifyAdmin } from '../_lib/auth-middleware.js';
import XLSX from 'xlsx';
import formidable from 'formidable';
import { extractEmbeddedImages, uploadExtractedImages } from '../_lib/excel-image-extractor.js';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Parse Excel file to JSON
 * @param {Buffer} fileBuffer - Excel file buffer
 * @param {Object} imageMap - Map of filename → uploaded URL (e.g., { "hero.jpg": "https://storage..." })
 * @returns {Array} Array of product objects
 */
function parseExcelToProducts(fileBuffer, imageMap = {}) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON with header row
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (rows.length === 0) {
    throw new Error('Excel file is empty');
  }

  // Map Excel columns to product schema
  const products = rows.map((row, index) => {
    try {
      // Required fields validation
      if (!row.name || !row.category || !row.price) {
        throw new Error(`Row ${index + 2}: Missing required fields (name, category, price)`);
      }

      // Parse stock info
      const stockQuantity = parseInt(row.stock || row.stockQuantity || 0);
      const stockStatus = row.stockStatus || (stockQuantity > 0 ? 'in_stock' : 'out_of_stock');

      // Parse price
      const price = parseFloat(row.price);
      const mrp = parseFloat(row.mrp || row.MRP || price);
      const discount = row.discount ? parseFloat(row.discount) : Math.round(((mrp - price) / mrp) * 100);

      // Parse tags
      const tags = row.tags ?
        (typeof row.tags === 'string' ? row.tags.split(',').map(t => t.trim()) : row.tags) :
        [];

      // Parse images - supports 3 tiers:
      // 1. Row-indexed images from embedded extraction or row-order matching
      // 2. URL values in the images column
      // 3. Filename resolution via imageMap
      let images = [];

      // Tier 1: Check for row-indexed image (embedded or row-order)
      // Supports single URL string or array of URLs (multiple images per product)
      const rowImage = imageMap[index] || imageMap[String(index)];
      if (rowImage) {
        const urls = Array.isArray(rowImage) ? rowImage : [rowImage];
        urls.forEach(url => {
          if (typeof url === 'string') {
            images.push({ url, alt: row.name });
          }
        });
      }

      // Tier 2 & 3: Parse images column (URLs or filenames)
      if (row.images && typeof row.images === 'string') {
        const columnImages = row.images.split(',')
          .map(entry => entry.trim())
          .filter(entry => entry.length > 0)
          .map(entry => {
            if (entry.startsWith('http://') || entry.startsWith('https://')) {
              return { url: entry, alt: row.name };
            }
            const resolvedUrl = imageMap[entry] || imageMap[entry.toLowerCase()];
            if (resolvedUrl) {
              return { url: resolvedUrl, alt: row.name };
            }
            return null;
          })
          .filter(Boolean);
        images.push(...columnImages);
      } else if (Array.isArray(row.images)) {
        images.push(...row.images);
      }

      // Parse specifications
      const specifications = {};
      if (row.frameSize) specifications.frameSize = row.frameSize;
      if (row.wheelSize) specifications.wheelSize = row.wheelSize;
      if (row.gears) specifications.gears = parseInt(row.gears);
      if (row.weight) specifications.weight = row.weight;
      if (row.maxLoad) specifications.maxLoad = row.maxLoad;
      if (row.brakeType) specifications.brakeType = row.brakeType;
      if (row.suspension) specifications.suspension = row.suspension;
      if (row.material) specifications.material = row.material;

      const product = {
        name: row.name.trim(),
        category: row.category.toLowerCase().trim(),
        description: row.description || '',
        price,
        mrp,
        discount,
        images,
        stock: {
          quantity: stockQuantity,
          status: stockStatus,
          lowStockThreshold: parseInt(row.lowStockThreshold || 5)
        },
        specifications,
        tags,
        brand: row.brand || 'Bharath Cycle Hub',
        ageRange: row.ageRange || '',
        isFeatured: row.isFeatured === 'true' || row.isFeatured === true || false,
        isNew: row.isNew === 'true' || row.isNew === true || false,
      };

      return product;
    } catch (error) {
      throw new Error(`Row ${index + 2}: ${error.message}`);
    }
  });

  return products;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Verify admin
    const admin = await verifyAdmin(req);
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Admin access required'
      });
    }

    // Parse multipart form data (supports Excel + up to 200 row-order images)
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB per file
      maxFiles: 250, // Excel + up to ~200 images
      maxTotalFileSize: 500 * 1024 * 1024, // 500MB total
      allowEmptyFiles: false,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file?.[0] || files.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload an Excel file (.xlsx, .xls, .csv)'
      });
    }

    // Parse imageMap from form fields (filename → URL mapping, Tier 3)
    let imageMap = {};
    const imageMapRaw = fields.imageMap?.[0] || fields.imageMap;
    if (imageMapRaw) {
      try {
        imageMap = JSON.parse(imageMapRaw);
      } catch (e) {
        console.warn('Failed to parse imageMap:', e.message);
      }
    }

    // Read import method
    const importMethod = fields.importMethod?.[0] || fields.importMethod || 'auto';

    // Read file buffer
    const fs = await import('fs');
    const fileBuffer = fs.readFileSync(file.filepath);

    let embeddedImagesFound = 0;
    let extractionMethod = 'filename';

    // === Tier 1: Auto-extract embedded images from XLSX ===
    const isXlsx = (file.originalFilename || file.newFilename || '').toLowerCase().endsWith('.xlsx');
    if ((importMethod === 'auto') && isXlsx) {
      try {
        console.log('🔍 Attempting embedded image extraction...');
        const extracted = await extractEmbeddedImages(fileBuffer);

        if (extracted.images.length > 0) {
          const uploadResult = await uploadExtractedImages(extracted.images);
          // Merge: row-indexed URLs (don't override manual imageMap)
          for (const [rowIdx, url] of Object.entries(uploadResult.imageMap)) {
            if (!imageMap[rowIdx]) {
              imageMap[rowIdx] = url;
            }
          }
          embeddedImagesFound = uploadResult.uploaded;
          extractionMethod = 'embedded';
          console.log(`✅ Extracted ${embeddedImagesFound} embedded images`);
        } else {
          console.log('ℹ️ No embedded images found, using filename matching');
        }
      } catch (err) {
        console.warn('⚠️ Embedded extraction failed, falling back:', err.message);
      }
    }

    // === Tier 2: Row-order matching ===
    if (importMethod === 'row-order') {
      const rowImageFiles = [];
      for (let i = 0; ; i++) {
        const imgFile = files[`rowImage_${i}`]?.[0] || files[`rowImage_${i}`];
        if (!imgFile) break;
        rowImageFiles.push(imgFile);
      }

      if (rowImageFiles.length > 0) {
        console.log(`📋 Row-order matching: ${rowImageFiles.length} images`);
        const { admin: firebaseAdmin } = await import('../_lib/firebase-admin.js');
        const bucket = firebaseAdmin.storage().bucket();

        // Upload in parallel batches of 10 — single API call per image
        const BATCH_SIZE = 10;
        for (let b = 0; b < rowImageFiles.length; b += BATCH_SIZE) {
          const batch = rowImageFiles.slice(b, b + BATCH_SIZE);
          await Promise.all(batch.map(async (imgFile, batchIdx) => {
            const i = b + batchIdx;
            try {
              const imgBuffer = fs.readFileSync(imgFile.filepath);
              const timestamp = Date.now();
              const randomStr = Math.random().toString(36).substring(2, 8);
              const ext = (imgFile.originalFilename || 'jpg').split('.').pop();
              const filename = `products/${timestamp}-${randomStr}.${ext}`;
              const storageFile = bucket.file(filename);

              await storageFile.save(imgBuffer, {
                predefinedAcl: 'publicRead',
                metadata: {
                  contentType: imgFile.mimetype || 'image/jpeg',
                  metadata: { source: 'row-order-import' },
                },
              });

              imageMap[i] = `https://storage.googleapis.com/${bucket.name}/${filename}`;
              fs.unlinkSync(imgFile.filepath);
            } catch (err) {
              console.warn(`⚠️ Failed to upload row-order image ${i}:`, err.message);
            }
          }));
        }
        extractionMethod = 'row-order';
        console.log(`✅ Row-order: uploaded ${Object.keys(imageMap).filter(k => !isNaN(k)).length} images`);
      }
    }

    // Parse Excel to products (with merged imageMap)
    const products = parseExcelToProducts(fileBuffer, imageMap);

    if (products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid products found in Excel file'
      });
    }

    // Bulk import products
    const result = await bulkImportProducts(products);

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${result.created} products`,
      data: {
        created: result.created,
        failed: result.failed,
        errors: result.errors,
        embeddedImagesFound,
        extractionMethod,
      }
    });

  } catch (error) {
    console.error('❌ Excel import error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to import Excel file'
    });
  }
}
