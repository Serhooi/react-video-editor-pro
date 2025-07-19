# S3 Setup Instructions

To set up S3 for media file storage, follow these steps:

## 1. Create S3 Bucket
```bash
aws s3 mb s3://video-editor-media --region us-east-1
```

## 2. Set Bucket Policy for Public Read Access
Create a file called `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::video-editor-media/*"
    }
  ]
}
```

Apply the policy:
```bash
aws s3api put-bucket-policy --bucket video-editor-media --policy file://bucket-policy.json
```

## 3. Enable CORS for Web Access
Create a file called `cors-config.json`:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": []
    }
  ]
}
```

Apply CORS configuration:
```bash
aws s3api put-bucket-cors --bucket video-editor-media --cors-configuration file://cors-config.json
```

## 4. Update Environment Variables
Update your `.env.local` file with your actual AWS credentials:

```
AWS_ACCESS_KEY_ID=your_actual_access_key
AWS_SECRET_ACCESS_KEY=your_actual_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=video-editor-media
```

## 5. IAM Permissions
Make sure your AWS user has the following permissions:
- s3:PutObject
- s3:GetObject
- s3:DeleteObject
- s3:ListBucket

You can create a custom policy with these permissions and attach it to your user.