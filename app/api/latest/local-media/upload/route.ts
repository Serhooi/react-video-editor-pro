import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Handles media file uploads to AWS S3
 * 
 * This API endpoint:
 * 1. Receives a file and user ID
 * 2. Uploads the file to S3 bucket
 * 3. Returns the S3 URL and file information
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
    
    // Initialize S3 client using the same credentials as Lambda
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.REMOTION_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.REMOTION_AWS_SECRET_ACCESS_KEY!,
      },
    });
    
    // Generate a unique filename
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileId}.${fileExtension}`;
    const s3Key = `media/${userId}/${fileName}`;
    
    console.log("📁 Generated S3 key:", s3Key);
    
    // Convert file to buffer
    console.log("📁 Converting file to buffer...");
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("📁 Buffer size:", buffer.length);
    
    // Upload to S3
    console.log("📁 Uploading to S3...");
    const bucketName = process.env.AWS_S3_BUCKET || 'video-editor-media';
    
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      ContentDisposition: 'inline',
      CacheControl: 'max-age=31536000', // Cache for 1 year
    });
    
    await s3Client.send(uploadCommand);
    console.log("📁 File uploaded to S3 successfully!");
    
    // Generate the public URL
    const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
    console.log("📁 Public URL:", publicUrl);
    
    const response = {
      success: true,
      id: fileId,
      fileName: file.name,
      serverPath: publicUrl,
      size: file.size,
      type: file.type,
    };
    
    console.log("📁 Upload successful! Response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
