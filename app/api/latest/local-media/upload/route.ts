import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handles media file uploads
 * 
 * This API endpoint:
 * 1. Receives a file and user ID
 * 2. Creates a user directory if it doesn't exist
 * 3. Saves the file to the user's directory
 * 4. Returns the file path and ID
 */
export async function POST(request: NextRequest) {
  console.log("📁 UPLOAD API CALLED!");
  
  try {
    const formData = await request.formData();
    console.log("📁 FormData received");
    
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    console.log("📁 File:", file ? `${file.name} (${file.size} bytes)` : "null");
    console.log("📁 UserId:", userId);
    
    if (!file || !userId) {
      console.error("📁 Missing file or userId");
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      );
    }
    
    // Create user directory if it doesn't exist
    // On Vercel, we need to use /tmp directory as it's the only writable location
    const userDir = path.join('/tmp', 'users', userId);
    console.log("📁 User directory:", userDir);
    
    if (!existsSync(userDir)) {
      console.log("📁 Creating user directory...");
      await mkdir(userDir, { recursive: true });
      console.log("📁 User directory created");
    } else {
      console.log("📁 User directory already exists");
    }
    
    // Generate a unique filename
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileId}.${fileExtension}`;
    const filePath = path.join(userDir, fileName);
    
    console.log("📁 Generated filename:", fileName);
    console.log("📁 Full file path:", filePath);
    
    // Convert file to buffer and save it
    console.log("📁 Converting file to buffer...");
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("📁 Buffer size:", buffer.length);
    
    console.log("📁 Writing file to disk...");
    await writeFile(filePath, buffer);
    console.log("📁 File written successfully!");
    
    // Return the file information
    // Since files are in /tmp, we need to serve them through an API endpoint
    const publicPath = `/api/latest/local-media/serve/${userId}/${fileName}`;
    console.log("📁 Public path:", publicPath);
    
    const response = {
      success: true,
      id: fileId,
      fileName: file.name,
      serverPath: publicPath,
      size: file.size,
      type: file.type,
    };
    
    console.log("📁 Upload successful! Response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
