# AWS S3 and SES Setup Guide

## Overview

This application now includes:

- **S3 File Upload**: For ticket attachments
- **SES Email Notifications**: For ticket creation and updates

## Prerequisites

1. AWS Account
2. AWS CLI configured (optional but recommended)
3. S3 Bucket created
4. SES configured and verified

## Setup Instructions

### 1. Create S3 Bucket

1. Go to AWS S3 Console
2. Create a new bucket (e.g., `your-ticketflow-files`)
3. Set appropriate permissions:
   - Block public access (recommended)
   - Enable versioning (optional)

### 2. Configure SES

1. Go to AWS SES Console
2. Verify your sending email address
3. If in sandbox mode, verify recipient email addresses
4. For production, request production access

### 3. Create IAM User (Recommended)

Create an IAM user with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    }
  ]
}
```

### 4. Update Environment Variables

Update `server/.env` with your AWS credentials:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_s3_bucket_name_here

# AWS SES Configuration
SES_FROM_EMAIL=noreply@yourdomain.com
SES_REGION=us-east-1

# Email Notification Settings
ADMIN_EMAIL=admin@yourdomain.com
FINANCE_EMAIL=finance@yourdomain.com
HR_EMAIL=hr@yourdomain.com

# Ticket Email Settings
SEND_NOTIFICATIONS=true
```

## Features Added

### File Upload

- **Maximum**: 5 files per ticket
- **Size Limit**: 10MB per file
- **Allowed Types**: JPG, PNG, PDF, DOC, TXT, ZIP, RAR
- **Storage**: Files stored in S3 with secure access

### Email Notifications

- **Trigger**: Sent when tickets are created or significantly updated
- **Recipients**: Department-specific emails based on ticket department
- **Template**: HTML and text versions with full ticket details
- **Changes Tracking**: Shows what fields were modified in updates

### API Endpoints Added

1. **POST `/api/tickets/upload`** - Upload files to S3
2. **GET `/api/tickets/file/:key`** - Get signed URL for file download

## Usage

### Frontend File Upload

The `FileUpload` component handles:

- Drag & drop file upload
- Progress indication
- File validation
- Error handling

### Email Notifications

Emails are sent automatically when:

- New ticket is created
- Ticket status, priority, or department changes
- Ticket subject or description is updated

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**
   - Check IAM permissions
   - Verify S3 bucket policy
   - Ensure AWS credentials are correct

2. **Email not sending**
   - Verify SES setup
   - Check if email addresses are verified
   - Review AWS SES sending limits

3. **File upload failures**
   - Check file size limits
   - Verify file type restrictions
   - Ensure S3 bucket exists and is accessible

### Environment Variables

Make sure all required environment variables are set:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`
- `SES_FROM_EMAIL`

## Security Considerations

1. **IAM Permissions**: Use minimal required permissions
2. **S3 Bucket**: Keep files private, use signed URLs for access
3. **Email**: Validate recipient addresses
4. **Environment Variables**: Never commit credentials to version control

## Testing

1. **File Upload**: Test with various file types and sizes
2. **Email**: Create/update tickets to verify notifications
3. **Download**: Test file download functionality

For any issues, check the server logs for detailed error messages.
