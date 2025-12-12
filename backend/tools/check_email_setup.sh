#!/bin/bash
# Production Email Deployment Checklist
# Run this before deploying to verify everything is ready

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║         📧 PRODUCTION EMAIL - DEPLOYMENT CHECKLIST            ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check counters
total=0
passed=0
failed=0

function check() {
    total=$((total + 1))
    if [ $1 -eq 0 ]; then
        echo -e "  ${GREEN}✓${NC} $2"
        passed=$((passed + 1))
    else
        echo -e "  ${RED}✗${NC} $2"
        failed=$((failed + 1))
    fi
}

function info() {
    echo -e "  ${BLUE}ℹ${NC} $1"
}

function warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
}

echo "${BLUE}1. Checking Package Dependencies${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if node_modules exists
if [ -d "node_modules/@sendgrid" ]; then
    check 0 "@sendgrid/mail package installed"
else
    check 1 "@sendgrid/mail package NOT installed"
    warn "Run: npm install"
fi

# Check package.json
if grep -q "@sendgrid/mail" package.json; then
    check 0 "SendGrid listed in package.json"
else
    check 1 "SendGrid NOT in package.json"
fi

echo ""
echo "${BLUE}2. Checking Code Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check mailer.js for SendGrid support
if grep -q "sendgrid" src/config/mailer.js; then
    check 0 "mailer.js supports SendGrid"
else
    check 1 "mailer.js missing SendGrid support"
fi

# Check if sendVerificationEmail exists
if grep -q "sendVerificationEmail" src/config/mailer.js; then
    check 0 "sendVerificationEmail function exists"
else
    check 1 "sendVerificationEmail function missing"
fi

echo ""
echo "${BLUE}3. Checking Environment Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check .env.example
if grep -q "SENDGRID_API_KEY" .env.example; then
    check 0 ".env.example includes SendGrid config"
else
    check 1 ".env.example missing SendGrid config"
fi

# Check local .env (optional)
if [ -f ".env" ]; then
    if grep -q "SENDGRID_API_KEY" .env 2>/dev/null; then
        info "Local .env has SendGrid config (for testing)"
    else
        info "Local .env exists but no SendGrid config (that's OK)"
    fi
else
    info "No local .env file (production uses Render env vars)"
fi

echo ""
echo "${BLUE}4. Documentation & Tools${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check documentation files
[ -f "PRODUCTION_EMAIL_SETUP.md" ] && check 0 "Setup guide exists" || check 1 "Setup guide missing"
[ -f "EMAIL_FIX_SUMMARY.md" ] && check 0 "Summary exists" || check 1 "Summary missing"
[ -f "QUICK_EMAIL_FIX.txt" ] && check 0 "Quick reference exists" || check 1 "Quick reference missing"
[ -f "tools/send_test_email.js" ] && check 0 "Test script exists" || check 1 "Test script missing"
[ -x "tools/setup_sendgrid.sh" ] && check 0 "Setup script is executable" || check 1 "Setup script not executable"

echo ""
echo "${BLUE}5. Render Production Checklist${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "  ${YELLOW}☐${NC} SendGrid account created (sendgrid.com)"
echo "  ${YELLOW}☐${NC} SendGrid API key generated"
echo "  ${YELLOW}☐${NC} Sender email verified in SendGrid"
echo "  ${YELLOW}☐${NC} SENDGRID_API_KEY added to Render env vars"
echo "  ${YELLOW}☐${NC} SMTP_FROM added to Render env vars"
echo "  ${YELLOW}☐${NC} Saved changes in Render (triggers redeploy)"
echo ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${BLUE}Results:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED ($passed/$total)${NC}"
    echo ""
    echo "Your code is ready for production!"
    echo ""
    echo "Next steps:"
    echo "  1. Set up SendGrid account (if not done)"
    echo "  2. Add environment variables to Render"
    echo "  3. Deploy to production"
    echo "  4. Test email registration"
    echo ""
    echo "For detailed instructions, see:"
    echo "  • PRODUCTION_EMAIL_SETUP.md (full guide)"
    echo "  • QUICK_EMAIL_FIX.txt (quick reference)"
    echo ""
else
    echo -e "${RED}⚠️  SOME CHECKS FAILED ($failed failed, $passed passed)${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
