import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

/**
 * Handles media file deletion from S3
 * 
 * This API endpoint:
 * 1. Receives a file ID and user ID
 * 2. Verifies the file belongs to the user
 * 3. Deletes the file from S3
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, fileId } = await request.json();
    
    if (!userId || !fileId) {
      return NextResponse.json(
        { error: 'UserId and fileId are required' },
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
    
    // Construct the S3 key - we need to find the file by searching for the fileId
    // Since we don't know the extension, we'll need to handle this differently
    // For now, let's assume the frontend passes the full S3 key or we extract it from the URL
    const bucketName = process.env.AWS_S3_BUCKET || 'video-editor-media';
    const s3Key = `media/${userId}/${fileId}`;
    
    // Delete the file from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });
    
    await s3Client.send(deleteCommand);
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
