#!/usr/bin/env node

/**
 * Quick AWS setup script for video editor
 * Run after adding AWS credentials to .env.local
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🚀 Setting up AWS infrastructure for video editor...\n');

// Check if credentials are set
if (!process.env.REMOTION_AWS_ACCESS_KEY_ID || process.env.REMOTION_AWS_ACCESS_KEY_ID.includes('your_')) {
  console.error('❌ AWS credentials not set!');
  console.log('Please update .env.local with your real AWS credentials first.');
  console.log('See setup instructions in the console output above.');
  process.exit(1);
}

try {
  console.log('1️⃣ Deploying Lambda function with 3GB RAM...');
  execSync('npm run deploy', { stdio: 'inherit' });
  console.log('✅ Lambda function deployed!\n');

  console.log('2️⃣ Creating S3 bucket for media storage...');
  execSync('node create-s3-bucket.js', { stdio: 'inherit' });
  console.log('✅ S3 bucket created!\n');

  console.log('🎉 AWS setup complete!');
  console.log('Your video editor can now:');
  console.log('  ✅ Upload files to S3');
  console.log('  ✅ Render videos with Lambda (3GB RAM)');
  console.log('  ✅ Handle complex video projects');
  console.log('\n🔗 Test your editor at: https://video-editor-ten-sand.vercel.app/versions/7.0.0');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log('\n💡 Common issues:');
  console.log('  1. Check AWS credentials are correct');
  console.log('  2. Ensure AWS CLI permissions are sufficient');
  console.log('  3. Verify region is supported (us-east-1 recommended)');
}