// Helper to store media files in the media table
import pool from "../config/db.js";

/**
 * Store a media file (image, video, or document) in the media table
 * @param {number} propertyId - The property ID this media belongs to
 * @param {Buffer} fileBuffer - The binary file buffer
 * @param {string} mimeType - MIME type (e.g., 'image/jpeg', 'video/mp4')
 * @param {string} fileType - File category ('image', 'video', 'document')
 * @returns {Promise<number>} - The media ID
 */
export const storeMedia = async (propertyId, fileBuffer, mimeType, fileType) => {
  try {
    const fileSize = fileBuffer.length;
    
    const result = await pool.query(
      `INSERT INTO media (property_id, file_type, mime_type, file_size, file_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [propertyId, fileType, mimeType, fileSize, fileBuffer]
    );
    
    return result.rows[0].id;
  } catch (err) {
    throw err;
  }
};

/**
 * Retrieve media file from database
 * @param {number} mediaId - The media ID to retrieve
 * @returns {Promise<Object>} - Object with { file_data, mime_type }
 */
export const getMedia = async (mediaId) => {
  try {
    const result = await pool.query(
      `SELECT file_data, mime_type FROM media WHERE id = $1`,
      [mediaId]
    );
    
    if (result.rows.length === 0) {
      throw new Error("Media not found");
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

/**
 * Store multiple images and return array of media IDs
 * @param {number} propertyId - The property ID
 * @param {Array<Buffer>} imageBuffers - Array of image buffers
 * @returns {Promise<Array<number>>} - Array of media IDs
 */
export const storeImages = async (propertyId, imageBuffers) => {
  const mediaIds = [];
  
  for (const buffer of imageBuffers) {
    const mediaId = await storeMedia(propertyId, buffer, "image/jpeg", "image");
    mediaIds.push(mediaId);
  }
  
  return mediaIds;
};
