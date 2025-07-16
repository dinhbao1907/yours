# YOURS Fashion Design - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **MongoDB Database**: Set up a MongoDB database (MongoDB Atlas recommended)
4. **PayOS Account**: For payment processing
5. **Gmail App Password**: For email notifications

## Step 1: Prepare Your Repository

1. Make sure your code is committed to GitHub
2. Ensure all files are properly tracked (check `.gitignore`)

## Step 2: Set Up Environment Variables

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yours-db
JWT_SECRET=your_very_secure_jwt_secret_key_here
EMAIL_USER=official.yours.fashiondesign@gmail.com
EMAIL_PASS=your_gmail_app_password
PAYOS_CLIENT_ID=12fdcdb7-433f-4230-aa68-505ce0b8dbae
PAYOS_API_KEY=10b4a65b-d594-4781-9bb6-c70c41c84016
PAYOS_CHECKSUM_KEY=f78c58627c4a3a7345f69488e43010f3ec6207344b5734fc9c082a2872694952
NODE_ENV=production
ALLOWED_ORIGINS=https://yoursfashion.id.vn,https://yours-fashion.vercel.app
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password
```

## Step 3: Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Link to existing project or create new
   - Set project name (e.g., "yours-fashion")
   - Confirm deployment

### Method 2: GitHub Integration

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: Node.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: ./
   - Install Command: `npm install`

## Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to "Domains"
2. Add your custom domain (e.g., yoursfashion.id.vn)
3. Update DNS records as instructed

## Step 5: Set Up Webhooks

### PayOS Webhook URL:
```
https://your-vercel-domain.vercel.app/api/payos/webhook
```

## Step 6: Test Your Deployment

1. Visit your deployed URL
2. Test user registration/login
3. Test payment flow
4. Test admin dashboard
5. Verify email notifications

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Working**
   - Check variable names match exactly
   - Redeploy after adding variables

2. **MongoDB Connection Issues**
   - Verify connection string
   - Check IP whitelist in MongoDB Atlas

3. **Payment Issues**
   - Verify PayOS credentials
   - Check webhook URL configuration

4. **Email Not Sending**
   - Verify Gmail app password
   - Check email service configuration

### Debug Commands:

```bash
# View deployment logs
vercel logs

# Redeploy
vercel --prod

# Check environment variables
vercel env ls
```

## Post-Deployment Checklist

- [ ] All pages load correctly
- [ ] User registration works
- [ ] Email verification works
- [ ] Payment processing works
- [ ] Admin dashboard accessible
- [ ] File uploads work
- [ ] Email notifications sent
- [ ] Mobile responsiveness
- [ ] SSL certificate active

## Support

For issues:
1. Check Vercel deployment logs
2. Review server.js console logs
3. Verify environment variables
4. Test locally with same config 