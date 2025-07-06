import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Alternative upload method using HTTP instead of FTP
export async function uploadToHostingHTTP(
  fileBuffer: Buffer, 
  originalName: string, 
  customerId: string, 
  type: 'profile' | 'nidfront' | 'nidback'
): Promise<{ fileName: string; imageUrl: string; success: boolean }> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const extension = originalName.split('.').pop() || 'jpg';
    const fileName = `${customerId}-${type}-${timestamp}-${randomSuffix}.${extension}`;
    
    // Create form data for PHP upload handler
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    formData.append('file', blob, fileName);
    formData.append('customerId', customerId);
    formData.append('type', type);
    
    // Upload to PHP handler on cPanel
    const uploadUrl = process.env.UPLOAD_HANDLER_URL || 'https://server.procloudify.com/~pasherdo/upload-handler.php';
    
    console.log('Uploading via HTTP to:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP upload error response:', response.status, response.statusText);
      console.error('HTTP upload error body:', errorText);
      throw new Error(`HTTP upload failed: ${response.status} ${response.statusText}`);
    }
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    // Clean up the response text (remove any extra PHP tags or characters)
    let cleanedResponse = responseText.trim();
    // Remove ?> from the end
    if (cleanedResponse.endsWith('?>')) {
      cleanedResponse = cleanedResponse.slice(0, -2);
    }
    // Find the JSON by looking for the last }
    const lastBraceIndex = cleanedResponse.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      cleanedResponse = cleanedResponse.substring(0, lastBraceIndex + 1);
    }
    
    let result;
    try {
      result = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response text:', responseText);
      console.error('Cleaned response:', cleanedResponse);
      throw new Error('Invalid JSON response from upload handler');
    }
    
    console.log('HTTP upload result:', result);
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }
    
    return {
      fileName: result.filename,
      imageUrl: result.url,
      success: true
    };
    
  } catch (error) {
    console.error('HTTP upload error:', error);
    throw error;
  }
}
