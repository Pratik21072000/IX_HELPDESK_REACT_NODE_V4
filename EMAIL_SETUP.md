# Email Notifications Setup

This application uses Amazon SES (Simple Email Service) to send email notifications when tickets are created or updated.

## Features

- 📧 **Automatic email notifications** when new tickets are created
- 🎯 **Department-specific routing** - emails sent to the selected department
- 📊 **Rich HTML email templates** with ticket details
- ⚡ **Priority-based formatting** with special styling for high-priority tickets
- 🔄 **Status update notifications** sent to ticket creators
- 📱 **Mobile-friendly** email templates

## Email Triggers

### New Ticket Created

- **When**: A user creates a new ticket
- **Sent to**: Department email (based on selected department)
- **CC**: Optional additional recipients (configurable)
- **Contains**: Complete ticket details, priority, description, creator info

### Ticket Status Updated

- **When**: A manager updates a ticket status
- **Sent to**: Original ticket creator
- **Contains**: Status change details and any comments

## AWS SES Configuration

### 1. Set up Amazon SES

1. **Create AWS Account** (if you don't have one)
2. **Navigate to SES Console** in your AWS region
3. **Verify your domain** or **individual email addresses**
4. **Create IAM credentials** with SES permissions

### 2. IAM Permissions Required

Your AWS IAM user needs the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    }
  ]
}
```

### 3. Environment Variables

Update your `.env` file with your AWS credentials and email addresses:

```env
# Amazon SES Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_SES_REGION="us-east-1"
SES_FROM_EMAIL="noreply@yourcompany.com"

# Department Email Addresses
ADMIN_EMAIL="admin@yourcompany.com"
FINANCE_EMAIL="finance@yourcompany.com"
HR_EMAIL="hr@yourcompany.com"

# Optional: CC emails for all notifications (comma-separated)
CC_EMAILS="manager@yourcompany.com,supervisor@yourcompany.com"
```

### 4. Verify Email Addresses

In **SES Console**:

1. Go to **"Verified identities"**
2. Click **"Create identity"**
3. Choose **"Email address"**
4. Enter your department email addresses
5. Click **"Create identity"**
6. Check the email inbox and click the verification link

**Note**: In sandbox mode, you can only send emails to verified addresses.

### 5. Production Setup

For production:

1. **Request production access** in SES Console
2. **Set up domain verification** for your company domain
3. **Configure DKIM** for better deliverability
4. **Set up bounce and complaint handling**

## Email Templates

### New Ticket Email Includes:

- 🎫 Ticket number and subject
- 👤 Creator information (name, role)
- 🏢 Department and category details
- ⚡ Priority level with color coding
- 📝 Full description
- 📅 Creation timestamp
- 🔗 Direct link to dashboard
- 🚨 Special alerts for high-priority tickets

### Status Update Email Includes:

- 🔄 Status change (old → new)
- 💬 Manager comments (if any)
- 🔗 Link to view ticket details

## Testing Email Setup

### 1. Test with Demo Users

1. Login with any demo user (e.g., `admin.manager`)
2. Create a new ticket
3. Select a department (ADMIN, FINANCE, or HR)
4. Check the corresponding department email inbox

### 2. Verify Email Delivery

Check your email service for:

- ✅ Email delivered successfully
- ❌ Bounce notifications
- ⚠️ Spam folder placement

### 3. Check Application Logs

Monitor the console for email sending status:

```bash
# Successful email
Email sent successfully for ticket #123: MessageId

# Failed email (check configuration)
Failed to send ticket notification email: [Error details]
```

## Troubleshooting

### Common Issues:

1. **"AWS SES credentials not configured"**

   - Check that `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set
   - Verify credentials are correct

2. **"Email address not verified"**

   - Verify all department email addresses in SES Console
   - Request production access if needed

3. **Emails going to spam**

   - Set up domain verification and DKIM
   - Ensure your "From" email domain is verified
   - Add SPF records to your DNS

4. **High email bounces**
   - Verify all recipient email addresses are valid
   - Check for typos in environment variables

### Debug Mode

To test email templates without sending:

```typescript
// In development, you can test the email template generation
import { generateTicketEmailHTML } from "@/lib/emailService";

// This will return the HTML without sending
const htmlContent = generateTicketEmailHTML(ticketData);
console.log(htmlContent);
```

## Security Best Practices

1. **Use IAM roles** instead of access keys when possible
2. **Rotate credentials** regularly
3. **Limit SES permissions** to only what's needed
4. **Monitor usage** to detect unusual activity
5. **Use verified domains** instead of individual email addresses in production

## Cost Optimization

- Amazon SES pricing: $0.10 per 1,000 emails
- Monitor your usage in AWS Console
- Set up billing alerts for unexpected costs
- Consider using SES templates for high-volume scenarios

## Production Deployment

For production deployment:

1. Update environment variables with production values
2. Verify your production domain in SES
3. Request production access (removes sandbox limitations)
4. Set up proper DNS records (SPF, DKIM, DMARC)
5. Configure bounce and complaint handling
6. Test thoroughly before going live

---

**Need Help?** Check the [AWS SES Documentation](https://docs.aws.amazon.com/ses/) or contact your system administrator.
