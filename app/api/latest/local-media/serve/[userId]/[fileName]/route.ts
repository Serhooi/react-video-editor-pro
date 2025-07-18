import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Serves uploaded media files from the /tmp directory
 * 
 * This API endpoint:
 * 1. Receives userId and fileName from URL params
 * 2. Reads the file from /tmp/users/{userId}/{fileName}
 * 3. Returns the file with appropriate headers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; fileName: string } }
) {
  console.log("📤 SERVE FILE API CALLED!");
  console.log("📤 UserId:", params.userId);
  console.log("📤 FileName:", params.fileName);
  
  try {
    const { userId, fileName } = params;
    
    if (!userId || !fileName) {
      console.error("📤 Missing userId or fileName");
      return NextResponse.json(
        { error: 'UserId and fileName are required' },
        { status: 400 }
      );
    }
    
    // Construct file path
    const filePath = path.join('/tmp', 'users', userId, fileName);
    console.log("📤 File path:", filePath);
    
    // Check if file exists
    if (!existsSync(filePath)) {
      console.error("📤 File not found:", filePath);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read file
    console.log("📤 Reading file...");
    const fileBuffer = await readFile(filePath);
    console.log("📤 File read successfully, size:", fileBuffer.length);
    
    // Determine content type based on file extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (fileExtension) {
      case 'mp4':
        contentType = 'video/mp4';
        break;
      case 'webm':
        contentType = 'video/webm';
        break;
      case 'mov':
        contentType = 'video/quicktime';
        break;
      case 'avi':
        contentType = 'video/x-msvideo';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'mp3':
        contentType = 'audio/mpeg';
        break;
      case 'wav':
        contentType = 'audio/wav';
        break;
      case 'ogg':
        contentType = 'audio/ogg';
        break;
      default:
        console.log("📤 Unknown file extension:", fileExtension);
    }
    
    console.log("📤 Content type:", contentType);
    
    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    });
    
  } catch (error) {
    console.error('📤 Error serving file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}