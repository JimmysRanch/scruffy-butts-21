# Email Template for Staff Onboarding

When a new staff member is onboarded, they receive a welcome email with a password reset link. This email is sent automatically by Supabase Auth.

## Customizing the Email Template

You can customize this email in your Supabase dashboard:

1. Go to **Authentication → Email Templates**
2. Select **Reset Password** template
3. Edit the template using the variables below

## Recommended Welcome Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Scruffy Butts</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e1e4e8;
      border-top: none;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      background: #f6f8fa;
      padding: 20px;
      border-radius: 0 0 8px 8px;
      text-align: center;
      font-size: 14px;
      color: #6a737d;
    }
    .info-box {
      background: #f1f8ff;
      border-left: 4px solid #0366d6;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🐾 Welcome to Scruffy Butts!</h1>
  </div>
  
  <div class="content">
    <p>Hi there,</p>
    
    <p>Congratulations! You've been added as a new team member at Scruffy Butts. We're excited to have you join our grooming family!</p>
    
    <p>To get started, please set up your account by creating a secure password:</p>
    
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Set Up My Account</a>
    </div>
    
    <div class="info-box">
      <strong>⏰ Important:</strong> This link will expire in 24 hours for security reasons. If you don't set up your account within this time, please contact your manager for a new invitation.
    </div>
    
    <p><strong>What happens next?</strong></p>
    <ol>
      <li>Click the button above to open the account setup page</li>
      <li>Create a strong, secure password</li>
      <li>You'll be logged in automatically</li>
      <li>Start using the Scruffy Butts platform!</li>
    </ol>
    
    <p><strong>Need help?</strong> If you have any questions or run into any issues, please don't hesitate to reach out to your manager or team lead.</p>
    
    <p>We're thrilled to have you on board and look forward to working with you!</p>
    
    <p>Best regards,<br>
    <strong>The Scruffy Butts Team</strong></p>
  </div>
  
  <div class="footer">
    <p>If the button above doesn't work, copy and paste this link into your browser:</p>
    <p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>
    <p>If you didn't expect this email, you can safely ignore it.</p>
  </div>
</body>
</html>
```

## Plain Text Version

Supabase also supports a plain text version for email clients that don't support HTML:

```
Welcome to Scruffy Butts!

Hi there,

Congratulations! You've been added as a new team member at Scruffy Butts. We're excited to have you join our grooming family!

To get started, please set up your account by creating a secure password:

{{ .ConfirmationURL }}

IMPORTANT: This link will expire in 24 hours for security reasons. If you don't set up your account within this time, please contact your manager for a new invitation.

What happens next?
1. Click the link above to open the account setup page
2. Create a strong, secure password
3. You'll be logged in automatically
4. Start using the Scruffy Butts platform!

Need help? If you have any questions or run into any issues, please don't hesitate to reach out to your manager or team lead.

We're thrilled to have you on board and look forward to working with you!

Best regards,
The Scruffy Butts Team

---

If you didn't expect this email, you can safely ignore it.
```

## Available Variables

Supabase provides these variables you can use in your email templates:

- `{{ .ConfirmationURL }}` - The password reset/setup link
- `{{ .Email }}` - The user's email address
- `{{ .Token }}` - The confirmation token (in case you want to build custom links)
- `{{ .TokenHash }}` - The hashed token
- `{{ .SiteURL }}` - Your site URL (from Supabase settings)

## Email Configuration in Supabase

### SMTP Settings

By default, Supabase sends emails through their own SMTP server. For production, you may want to configure your own:

1. Go to **Authentication → Email Templates → SMTP Settings**
2. Configure your SMTP server details:
   - Host (e.g., smtp.gmail.com)
   - Port (usually 587 for TLS)
   - Username
   - Password
   - Sender email
   - Sender name

### Email Rate Limiting

To prevent abuse:
1. Go to **Authentication → Settings**
2. Configure email rate limiting
3. Set maximum emails per hour (recommended: 10-20)

### Testing Email Delivery

Test your email template:
1. Create a test staff member via the API
2. Check your email (including spam folder)
3. Verify the link works and styling displays correctly
4. Test on multiple email clients (Gmail, Outlook, etc.)

## Troubleshooting Email Issues

### Emails Not Sending

1. Check Supabase logs: **Project → Logs → Auth Logs**
2. Verify SMTP configuration if using custom SMTP
3. Check email rate limits haven't been exceeded
4. Verify the email address is valid

### Emails Going to Spam

1. Configure SPF, DKIM, and DMARC records for your domain
2. Use a reputable SMTP provider (SendGrid, Mailgun, etc.)
3. Avoid spam trigger words in subject/content
4. Include an unsubscribe link

### Link Not Working

1. Verify `NEXT_PUBLIC_APP_URL` is set correctly in environment variables
2. Check the redirect URL in Supabase Auth settings
3. Ensure the link hasn't expired (24-hour limit)
4. Check browser console for errors

## Best Practices

1. **Keep it Simple**: Clear call-to-action, minimal distractions
2. **Mobile-Friendly**: Responsive design that works on all devices
3. **Professional Tone**: Welcoming but professional
4. **Security Note**: Explain why the link expires
5. **Help Options**: Provide contact information for support
6. **Test Thoroughly**: Test on multiple email clients and devices
7. **Accessibility**: Use semantic HTML and sufficient color contrast
8. **Fallback**: Always provide plain text version

## Custom Branding

To match your brand:
1. Update colors to match your brand palette
2. Add your logo (host image externally, then use `<img src="...">`)
3. Customize fonts (use web-safe fonts or Google Fonts)
4. Update wording to match your company voice
5. Add your company address in footer (if required)

## Example Customization for Scruffy Butts Brand

Based on the liquid glass aesthetic with purple/lavender hue (240°):

```css
.header {
  background: linear-gradient(135deg, oklch(0.60 0.20 240) 0%, oklch(0.65 0.22 240) 100%);
}

.button {
  background: oklch(0.60 0.20 240);
  box-shadow: 0 4px 16px oklch(0.60 0.20 240 / 0.3);
}

.info-box {
  background: oklch(0.65 0.22 240 / 0.1);
  border-left: 4px solid oklch(0.60 0.20 240);
}
```

## See Also

- Supabase Email Templates Documentation: https://supabase.com/docs/guides/auth/auth-email-templates
- Email Template Best Practices: https://www.litmus.com/blog/best-practices-for-plain-text-emails-a-look-at-why-theyre-important
