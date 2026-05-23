# Fix SMTP Configuration Script for VoiceForge AI
# Run this in PowerShell: .\scripts\fix-smtp.ps1

Write-Host "=== VoiceForge AI SMTP Configuration Fix ===" -ForegroundColor Cyan
Write-Host ""

$envPath = Join-Path $PSScriptRoot "..\.env"

# Check if .env exists
if (-not (Test-Path $envPath)) {
    Write-Host "ERROR: .env file not found at $envPath" -ForegroundColor Red
    exit 1
}

# Read current .env
$content = Get-Content $envPath -Raw

Write-Host "Current SMTP Configuration:" -ForegroundColor Yellow
Select-String -Path $envPath -Pattern "^SMTP_" | ForEach-Object {
    $line = $_.Line
    if ($line -match "^SMTP_PASS=") {
        Write-Host "  SMTP_PASS=******** (hidden)" -ForegroundColor Gray
    } else {
        Write-Host "  $line" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Namecheap Private Email Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To fix the '535 authentication failed' error, check these things:" -ForegroundColor White
Write-Host ""
Write-Host "1. LOG INTO NAMECHEAP PANEL:" -ForegroundColor Yellow
Write-Host "   https://www.namecheap.com/" -ForegroundColor Blue
Write-Host "   Go to: Domain List → Manage → Advanced DNS → Mail Settings" -ForegroundColor Gray
Write-Host ""
Write-Host "2. VERIFY EMAIL ACCOUNT EXISTS:" -ForegroundColor Yellow
Write-Host "   Make sure 'support@voiceforgeai.site' is created and ACTIVE" -ForegroundColor Gray
Write-Host ""
Write-Host "3. RESET PASSWORD IN NAMECHEAP:" -ForegroundColor Yellow  
Write-Host "   - Click 'Change Password' for the email account" -ForegroundColor Gray
Write-Host "   - Set a new password (write it down!)" -ForegroundColor Gray
Write-Host ""

# Ask user for correct credentials
Write-Host "Enter your CORRECT Namecheap email credentials:" -ForegroundColor Green
Write-Host ""

$smtpUser = Read-Host -Prompt "SMTP User (full email, e.g., support@voiceforgeai.site)"
$smtpPass = Read-Host -Prompt "SMTP Password (the one you just set in Namecheap)" -AsSecureString
$smtpFrom = Read-Host -Prompt "From Email (e.g., VoiceForge AI <support@voiceforgeai.site>)"

if (-not $smtpUser -or -not $smtpPass) {
    Write-Host "ERROR: User and password are required!" -ForegroundColor Red
    exit 1
}

# Convert secure string to plain text (for .env file)
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($smtpPass)
$plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Update .env file
Write-Host ""
Write-Host "Updating .env file..." -ForegroundColor Yellow

# Remove old SMTP lines
$content = $content -replace "(?m)^SMTP_HOST=.*\r?\n", ""
$content = $content -replace "(?m)^SMTP_PORT=.*\r?\n", ""
$content = $content -replace "(?m)^SMTP_SECURE=.*\r?\n", ""
$content = $content -replace "(?m)^SMTP_USER=.*\r?\n", ""
$content = $content -replace "(?m)^SMTP_PASS=.*\r?\n", ""
$content = $content -replace "(?m)^EMAIL_FROM=.*\r?\n", ""

# Add new SMTP configuration (using port 587 which is more reliable)
$smtpConfig = @"

# SMTP Configuration - Namecheap Private Email
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=$smtpUser
SMTP_PASS=$plainPass
EMAIL_FROM=$smtpFrom

"@

# Append to end of file
$content = $content.TrimEnd() + $smtpConfig

# Write back to .env
$content | Set-Content $envPath -NoNewline

Write-Host ""
Write-Host "=== SUCCESS! ===" -ForegroundColor Green
Write-Host "SMTP configuration updated in .env file" -ForegroundColor Green
Write-Host ""
Write-Host "New settings:" -ForegroundColor Yellow
Write-Host "  SMTP_HOST=mail.privateemail.com" -ForegroundColor Gray
Write-Host "  SMTP_PORT=587 (STARTTLS - most reliable)" -ForegroundColor Gray
Write-Host "  SMTP_USER=$smtpUser" -ForegroundColor Gray
Write-Host "  SMTP_PASS=********" -ForegroundColor Gray
Write-Host "  EMAIL_FROM=$smtpFrom" -ForegroundColor Gray
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Restart your backend server (Ctrl+C, then npm run dev)" -ForegroundColor White
Write-Host "2. Test the email functionality" -ForegroundColor White
Write-Host ""
Write-Host "If it still fails, double-check the password in Namecheap panel!" -ForegroundColor Yellow
