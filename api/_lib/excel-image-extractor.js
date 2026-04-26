/**
 * Excel Image Extractor
 *
 * Extracts embedded images from XLSX files by parsing the ZIP structure.
 * XLSX files are ZIP archives containing:
 *   - xl/media/image1.png, image2.jpg, etc. (the actual images)
 *   - xl/drawings/drawing1.xml (image-to-cell anchor mappings)
 *   - xl/worksheets/_rels/sheet1.xml.rels (sheet-to-drawing relationships)
 */

import JSZip from 'jszip';
import { parseStringPromise } from 'xml2js';
import { admin } from './firebase-admin.js';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB per image
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'];
const MIME_MAP = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
};

/**
 * Extract embedded images from an XLSX buffer and map them to row indices.
 * @param {Buffer} xlsxBuffer - The raw XLSX file buffer
 * @returns {Promise<{images: Array<{buffer: Buffer, ext: string, rowIndex: number}>, error?: string}>}
 */
export async function extractEmbeddedImages(xlsxBuffer) {
  const zip = await JSZip.loadAsync(xlsxBuffer);

  // 1. Find all images in xl/media/
  const mediaFiles = {};
  for (const [path, file] of Object.entries(zip.files)) {
    if (path.startsWith('xl/media/') && !file.dir) {
      const ext = path.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) continue;

      const buffer = await file.async('nodebuffer');
      if (buffer.length > MAX_IMAGE_SIZE) {
        console.warn(`⚠️ Skipping ${path}: exceeds 5MB limit (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
        continue;
      }

      // Key is the filename e.g. "image1.png"
      const filename = path.split('/').pop();
      mediaFiles[filename] = { buffer, ext };
    }
  }

  if (Object.keys(mediaFiles).length === 0) {
    return { images: [], error: 'No embedded images found in Excel file.' };
  }

  // 2. Find the drawing relationship for sheet1
  //    xl/worksheets/_rels/sheet1.xml.rels links rId -> ../drawings/drawing1.xml
  let drawingPath = null;
  const sheetRelsPath = 'xl/worksheets/_rels/sheet1.xml.rels';
  if (zip.files[sheetRelsPath]) {
    const relsXml = await zip.files[sheetRelsPath].async('text');
    const rels = await parseStringPromise(relsXml, { explicitArray: false });
    const relationships = Array.isArray(rels.Relationships?.Relationship)
      ? rels.Relationships.Relationship
      : rels.Relationships?.Relationship ? [rels.Relationships.Relationship] : [];

    for (const rel of relationships) {
      if (rel.$.Type?.includes('/drawing')) {
        // Target is relative like "../drawings/drawing1.xml"
        drawingPath = 'xl/' + rel.$.Target.replace('../', '');
        break;
      }
    }
  }

  if (!drawingPath || !zip.files[drawingPath]) {
    // No drawing XML found — images exist but no cell anchors
    // Fall back: assign images sequentially to rows 0, 1, 2...
    console.warn('⚠️ No drawing XML found. Assigning images by order in xl/media/.');
    const images = Object.entries(mediaFiles).map(([, data], index) => ({
      buffer: data.buffer,
      ext: data.ext,
      rowIndex: index,
    }));
    return { images };
  }

  // 3. Parse drawing XML to map rId -> row index
  const drawingXml = await zip.files[drawingPath].async('text');
  const drawing = await parseStringPromise(drawingXml, { explicitArray: true });

  // 4. Get drawing rels to map rId -> media filename
  //    xl/drawings/_rels/drawing1.xml.rels
  const drawingFilename = drawingPath.split('/').pop();
  const drawingRelsPath = `xl/drawings/_rels/${drawingFilename}.rels`;
  const rIdToFilename = {};

  if (zip.files[drawingRelsPath]) {
    const drawRelsXml = await zip.files[drawingRelsPath].async('text');
    const drawRels = await parseStringPromise(drawRelsXml, { explicitArray: false });
    const rels = Array.isArray(drawRels.Relationships?.Relationship)
      ? drawRels.Relationships.Relationship
      : drawRels.Relationships?.Relationship ? [drawRels.Relationships.Relationship] : [];

    for (const rel of rels) {
      if (rel.$.Target) {
        // Target like "../media/image1.png"
        const filename = rel.$.Target.split('/').pop();
        rIdToFilename[rel.$.Id] = filename;
      }
    }
  }

  // 5. Parse anchor elements to find row index for each image
  //    Supports both twoCellAnchor and oneCellAnchor
  const root = drawing['xdr:wsDr'] || drawing['wsDr'] || Object.values(drawing)[0];
  if (!root) {
    return { images: [], error: 'Could not parse drawing XML structure.' };
  }

  const images = [];
  const anchors = [
    ...(root['xdr:twoCellAnchor'] || []),
    ...(root['xdr:oneCellAnchor'] || []),
  ];

  for (const anchor of anchors) {
    // Get the row from the "from" element
    const from = anchor['xdr:from']?.[0];
    if (!from) continue;

    const row = parseInt(from['xdr:row']?.[0], 10);
    if (isNaN(row)) continue;

    // Row in drawing is 0-indexed (row 0 = header, row 1 = first data row)
    // Subtract 1 because data rows start at row 1 in Excel (row 0 is header)
    const dataRowIndex = row - 1;
    if (dataRowIndex < 0) continue; // Skip images in header row

    // Find the embedded image reference (rId)
    const pic = anchor['xdr:pic']?.[0];
    if (!pic) continue;

    const blipFill = pic['xdr:blipFill']?.[0];
    if (!blipFill) continue;

    const blip = blipFill['a:blip']?.[0];
    if (!blip) continue;

    const rId = blip.$?.['r:embed'];
    if (!rId) continue;

    const mediaFilename = rIdToFilename[rId];
    if (!mediaFilename || !mediaFiles[mediaFilename]) continue;

    images.push({
      buffer: mediaFiles[mediaFilename].buffer,
      ext: mediaFiles[mediaFilename].ext,
      rowIndex: dataRowIndex,
    });
  }

  if (images.length === 0 && Object.keys(mediaFiles).length > 0) {
    // Images exist but couldn't map to rows — assign by order
    console.warn('⚠️ Could not map images to rows. Assigning by order.');
    const fallbackImages = Object.entries(mediaFiles).map(([, data], index) => ({
      buffer: data.buffer,
      ext: data.ext,
      rowIndex: index,
    }));
    return { images: fallbackImages };
  }

  return { images };
}

/**
 * Upload extracted image buffers to Firebase Storage.
 * @param {Array<{buffer: Buffer, ext: string, rowIndex: number}>} images
 * @returns {Promise<{imageMap: Object, uploaded: number, failed: number}>}
 */
export async function uploadExtractedImages(images) {
  const bucket = admin.storage().bucket();
  const imageMap = {};
  let uploaded = 0;
  let failed = 0;

  // Upload in parallel batches of 10 — single API call per image (no separate makePublic)
  const BATCH_SIZE = 10;
  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (img) => {
      try {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const filename = `products/${timestamp}-${randomStr}.${img.ext}`;
        const file = bucket.file(filename);

        // Single call: save + make public via predefinedAcl (no separate makePublic needed)
        await file.save(img.buffer, {
          predefinedAcl: 'publicRead',
          metadata: {
            contentType: MIME_MAP[img.ext] || 'image/jpeg',
            metadata: {
              source: 'excel-embedded',
              extractedAt: new Date().toISOString(),
            },
          },
        });

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        // Support multiple images per row — store as array
        if (!imageMap[img.rowIndex]) {
          imageMap[img.rowIndex] = [publicUrl];
        } else {
          imageMap[img.rowIndex].push(publicUrl);
        }
        uploaded++;
      } catch (err) {
        console.warn(`⚠️ Failed to upload image for row ${img.rowIndex}:`, err.message);
        failed++;
      }
    }));
  }

  console.log(`✅ Embedded images: ${uploaded} uploaded, ${failed} failed`);
  return { imageMap, uploaded, failed };
}
