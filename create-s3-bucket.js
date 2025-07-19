#!/usr/bin/env node

/**
 * Simple script to create and configure S3 bucket for media storage
 * Run with: node create-s3-bucket.js
 */

require('dotenv').config({ path: '.env.local' });
const { S3Client, CreateBucketCommand, PutBucketPolicyCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

const BUCKET_NAME = 'video-editor-media';
const REGION = 'us-east-1';

async function createS3Bucket() {
  console.log('🪣 Setting up S3 bucket for media storage...');
  
  // Initialize S3 client
  const s3Client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    // 1. Create bucket
    console.log(`🪣 Creating bucket: ${BUCKET_NAME}`);
    await s3Client.send(new CreateBucketCommand({
      Bucket: BUCKET_NAME,
    }));
    console.log('✅ Bucket created successfully!');

    // 2. Set bucket policy for public read access
    console.log('🔓 Setting bucket policy for public read access...');
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
        }
      ]
    };

    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    }));
    console.log('✅ Bucket policy set successfully!');

    // 3. Set CORS configuration
    console.log('🌐 Setting CORS configuration...');
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
          AllowedOrigins: ['*'],
          ExposeHeaders: []
        }
      ]
    };

    await s3Client.send(new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration
    }));
    console.log('✅ CORS configuration set successfully!');

    console.log('\n🎉 S3 bucket setup complete!');
    console.log(`📁 Bucket name: ${BUCKET_NAME}`);
    console.log(`🌍 Region: ${REGION}`);
    console.log(`🔗 Base URL: https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/`);
    console.log('\n⚠️  Make sure to update your .env.local file with:');
    console.log(`AWS_S3_BUCKET=${BUCKET_NAME}`);
    console.log(`AWS_REGION=${REGION}`);

  } catch (error) {
    if (error.name === 'BucketAlreadyOwnedByYou') {
      console.log('ℹ️  Bucket already exists and is owned by you. Continuing with configuration...');
      
      // Still try to set policy and CORS
      try {
        const bucketPolicy = {
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicReadGetObject',
              Effect: 'Allow',
              Principal: '*',
              Action: 's3:GetObject',
              Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
            }
          ]
        };

        await s3Client.send(new PutBucketPolicyCommand({
          Bucket: BUCKET_NAME,
          Policy: JSON.stringify(bucketPolicy)
        }));
        console.log('✅ Bucket policy updated!');

        const corsConfiguration = {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
              AllowedOrigins: ['*'],
              ExposeHeaders: []
            }
          ]
        };

        await s3Client.send(new PutBucketCorsCommand({
          Bucket: BUCKET_NAME,
          CORSConfiguration: corsConfiguration
        }));
        console.log('✅ CORS configuration updated!');
        console.log('🎉 S3 bucket configuration complete!');
      } catch (configError) {
        console.error('❌ Error configuring existing bucket:', configError.message);
      }
    } else {
      console.error('❌ Error setting up S3 bucket:', error.message);
      console.log('\n💡 Make sure you have:');
      console.log('1. Valid AWS credentials in your environment');
      console.log('2. Proper IAM permissions for S3 operations');
      console.log('3. The bucket name is globally unique');
    }
  }
}

// Check if AWS credentials are available
if (!process.env.REMOTION_AWS_ACCESS_KEY_ID && !process.env.AWS_ACCESS_KEY_ID) {
  console.error('❌ AWS credentials not found!');
  console.log('Please set your AWS credentials in .env.local:');
  console.log('REMOTION_AWS_ACCESS_KEY_ID=your_access_key');
  console.log('REMOTION_AWS_SECRET_ACCESS_KEY=your_secret_key');
  process.exit(1);
}

createS3Bucket();