import axios from 'axios';
import FtpClient from 'ftp';
import path from 'path';

interface UploadResult {
  fileName: string;
  imageUrl: string;
}

/**
 * Main upload function - follows PasherDokan architecture
 * Uses HTTP upload as primary method with FTP fallback
 */
export async function uploadToHosting(
  fileBuffer: Buffer,
  originalName: string,
  customerId: string,
  type: 'profile' | 'nidfront' | 'nidback'
): Promise<UploadResult> {
  console.log(`Uploading ${type} for customer ${customerId}`);
  
  try {
    // Try HTTP upload first (faster and more reliable)
    return await uploadToHostingHTTP(fileBuffer, originalName, customerId, type);
  } catch (httpError) {
    console.warn('HTTP upload failed, trying FTP fallback:', httpError);
    
    try {
      // Fallback to FTP
      return await uploadToHostingFTP(fileBuffer, originalName, customerId, type);
    } catch (ftpError) {
      console.error('Both upload methods failed');
      throw new Error(`Upload failed: ${httpError instanceof Error ? httpError.message : 'Unknown error'}`);
    }
  }
}

/**
 * HTTP Upload to cPanel hosting via PHP handler
 * Primary upload method - fast and reliable
 */
async function uploadToHostingHTTP(
  fileBuffer: Buffer,
  originalName: string,
  customerId: string,
  type: string
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const extension = path.extname(originalName);
    const fileName = `${customerId}-${type}-${timestamp}-${randomSuffix}${extension}`;
    
    // Create form data
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: originalName.toLowerCase().endsWith('.png') ? 'image/png' : 
                   originalName.toLowerCase().endsWith('.gif') ? 'image/gif' :
                   originalName.toLowerCase().endsWith('.webp') ? 'image/webp' :
                   'image/jpeg'
    });
    formData.append('customerId', customerId);
    formData.append('type', type);
    
    // Upload to PHP handler
    const uploadUrl = process.env.UPLOAD_HANDLER_URL || 'https://server.procloudify.com/~pasherdo/upload-handler.php';
    
    console.log(`Attempting HTTP upload to: ${uploadUrl}`);
    
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.UPLOAD_AUTH_TOKEN || 'linkup-customer-secure-token-2025'}`
      },
      timeout: 30000, // 30 second timeout
      responseType: 'text' // Get raw text response to handle PHP issues
    });
    
    console.log('HTTP upload response status:', response.status);
    console.log('HTTP upload raw response:', response.data);
    
    // Clean up the response text (remove any extra PHP tags)
    let cleanedResponse = response.data.trim();
    // Remove ?> from the end
    if (cleanedResponse.endsWith('?>')) {
      cleanedResponse = cleanedResponse.slice(0, -2);
    }
    // Find the JSON by looking for the last }
    const lastBraceIndex = cleanedResponse.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      cleanedResponse = cleanedResponse.substring(0, lastBraceIndex + 1);
    }
    
    let responseData;
    try {
      responseData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw response:', response.data);
      console.error('Cleaned response:', cleanedResponse);
      throw new Error('Invalid JSON response from upload handler');
    }
    
    if (!responseData.success) {
      console.error('HTTP upload failed with error:', responseData.error);
      throw new Error(responseData.error || 'Upload failed');
    }
    
    console.log('HTTP upload successful:', responseData);
    
    return {
      fileName: responseData.filename,
      imageUrl: responseData.url
    };
  } catch (error: any) {
    console.error('HTTP upload request failed:', error.message);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    if (error.response) {
      console.error('HTTP response status:', error.response.status);
      console.error('HTTP response data:', error.response.data);
      
      // If we get HTML instead of JSON, it's likely a server error page
      if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
        throw new Error(`Server returned error page instead of JSON. Status: ${error.response.status}`);
      }
    }
    
    // Check if it's a timeout or network error
    if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timed out - file may be too large or server is slow');
    }
    
    throw new Error(`HTTP upload failed: ${error.message}`);
  }
}

/**
 * FTP Upload to cPanel hosting
 * Fallback method for when HTTP fails
 */
async function uploadToHostingFTP(
  fileBuffer: Buffer,
  originalName: string,
  customerId: string,
  type: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const client = new FtpClient();
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const extension = path.extname(originalName);
    const fileName = `${customerId}-${type}-${timestamp}-${randomSuffix}${extension}`;
    
    // Remote path on cPanel hosting
    const remotePath = `/public_html/uploads/customers/${customerId}/${fileName}`;
    
    client.on('ready', () => {
      // Create customer directory first
      const customerDir = `/public_html/uploads/customers/${customerId}`;
      
      client.mkdir(customerDir, true, (mkdirErr: any) => {
        // Continue even if mkdir fails (directory might already exist)
        
        // Upload the file
        client.put(fileBuffer, remotePath, (putErr: any) => {
          client.end();
          
          if (putErr) {
            reject(new Error(`FTP upload failed: ${putErr.message}`));
            return;
          }
          
          // Construct public URL
          const imageUrl = `https://server.procloudify.com/~pasherdo/uploads/customers/${customerId}/${fileName}`;
          
          resolve({
            fileName,
            imageUrl
          });
        });
      });
    });
    
    client.on('error', (err: any) => {
      reject(new Error(`FTP connection failed: ${err.message}`));
    });
    
    // Connect to cPanel FTP
    client.connect({
      host: process.env.FTP_HOST || '49.12.82.48',
      user: process.env.FTP_USER || 'pasherdo',
      password: process.env.FTP_PASSWORD || '8(il65CYZaT.3e',
      port: parseInt(process.env.FTP_PORT || '21'),
      connTimeout: 20000,
      pasvTimeout: 20000,
      keepalive: 20000,
      secure: false
    });
  });
}

/**
 * Delete image from hosting
 */
export async function deleteFromHosting(
  customerId: string,
  fileName: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const client = new FtpClient();
    const remotePath = `/public_html/uploads/customers/${customerId}/${fileName}`;
    
    client.on('ready', () => {
      client.delete(remotePath, (err: any) => {
        client.end();
        resolve(!err);
      });
    });
    
    client.on('error', () => {
      resolve(false);
    });
    
    client.connect({
      host: process.env.FTP_HOST || '49.12.82.48',
      user: process.env.FTP_USER || 'pasherdo',
      password: process.env.FTP_PASSWORD || '8(il65CYZaT.3e',
      port: parseInt(process.env.FTP_PORT || '21'),
      connTimeout: 10000,
      pasvTimeout: 10000,
      keepalive: 10000,
      secure: false
    });
  });
}
