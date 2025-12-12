#!/bin/bash

# 🚀 SendGrid Email Setup Script for Render Production
# This script helps configure SendGrid for production email delivery

echo "======================================"
echo "📧 SendGrid Setup for Production"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: SendGrid Account${NC}"
echo "1. Go to: https://sendgrid.com"
echo "2. Sign up for FREE account (100 emails/day)"
echo "3. Verify your email address"
echo ""
read -p "Press Enter when you've created your account..."

echo ""
echo -e "${BLUE}Step 2: Create API Key${NC}"
echo "1. In SendGrid Dashboard: Settings → API Keys"
echo "2. Click 'Create API Key'"
echo "3. Name: 'Digital Library Production'"
echo "4. Permission: 'Full Access' (or 'Mail Send')"
echo "5. Copy the API key (starts with SG.)"
echo ""
read -p "Enter your SendGrid API Key: " SENDGRID_KEY

if [[ ! $SENDGRID_KEY =~ ^SG\. ]]; then
    echo -e "${RED}⚠️  Warning: API key should start with 'SG.'${NC}"
    read -p "Continue anyway? (y/n): " continue
    if [[ $continue != "y" ]]; then
        echo "Exiting..."
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}Step 3: Verify Sender Email${NC}"
echo "1. In SendGrid: Settings → Sender Authentication"
echo "2. Choose 'Single Sender Verification'"
echo "3. Click 'Create New Sender'"
echo "4. Enter your email details"
echo "5. Check email and verify"
echo ""
read -p "Enter your verified sender email: " SENDER_EMAIL

echo ""
echo -e "${GREEN}✅ Configuration Ready!${NC}"
echo ""
echo "======================================"
echo "📝 Copy these to Render Environment Variables"
echo "======================================"
echo ""
echo "SENDGRID_API_KEY=$SENDGRID_KEY"
echo "SMTP_FROM=$SENDER_EMAIL"
echo ""
echo "======================================"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Go to: https://dashboard.render.com"
echo "2. Select service: digital-library-fqqr"
echo "3. Go to: Environment tab"
echo "4. Add the variables above"
echo "5. Click 'Save Changes'"
echo "6. Wait for automatic redeploy"
echo ""

echo -e "${BLUE}Testing:${NC}"
echo "After deployment, check logs for:"
echo "  ✅ 'SendGrid API configured for outgoing email'"
echo "  ❌ NOT 'Connection timeout'"
echo ""
echo "Then test registration at:"
echo "  https://thedigitallibrarynewapp.netlify.app"
echo ""

read -p "Would you like to save this config to a .env file? (y/n): " save_env

if [[ $save_env == "y" ]]; then
    ENV_FILE="$(dirname "$0")/../.env.production"
    echo "# Production Email Configuration" > "$ENV_FILE"
    echo "# Generated on $(date)" >> "$ENV_FILE"
    echo "" >> "$ENV_FILE"
    echo "SENDGRID_API_KEY=$SENDGRID_KEY" >> "$ENV_FILE"
    echo "SMTP_FROM=$SENDER_EMAIL" >> "$ENV_FILE"
    echo ""
    echo -e "${GREEN}✅ Saved to: $ENV_FILE${NC}"
    echo -e "${RED}⚠️  Don't commit this file to git!${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete! Follow the next steps above.${NC}"
