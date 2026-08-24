#!/bin/bash
set -e

VPS_USER="root"
VPS_HOST="222.167.207.161"
VPS_PASS="Demo@123"
NEXTUI_DIR="/root/MoneyPrinterTurbo2026/webui-next"
BUILD_DIR="/Users/girjesh/Desktop/cloudonfire/nextui_build"

echo "📦 Deploying world-class Next.js UI to VPS..."

# Upload all component files
for file in globals.css layout.js page.js ScriptTopic.js VideoSettings.js AudioSettings.js SubtitleSettings.js VideoCompiler.js TextToAudio.js SavedVideos.js SystemSettings.js; do
    if [ "$file" = "globals.css" ] || [ "$file" = "layout.js" ] || [ "$file" = "page.js" ]; then
        sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no \
            "$BUILD_DIR/$file" "$VPS_USER@$VPS_HOST:$NEXTUI_DIR/src/app/$file"
        echo "✅ Uploaded: src/app/$file"
    else
        sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no \
            "$BUILD_DIR/$file" "$VPS_USER@$VPS_HOST:$NEXTUI_DIR/src/components/$file"
        echo "✅ Uploaded: src/components/$file"
    fi
done

echo ""
echo "🏗️  Running next build on VPS..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" \
    "cd $NEXTUI_DIR && /opt/node/bin/node node_modules/.bin/next build 2>&1 | tail -30"

echo ""
echo "♻️  Restarting PM2 process..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" \
    "pm2 restart money-printer-nextui && pm2 save"

echo ""
echo "✅ Deployment complete! New UI is live at http://222.167.207.161:3000"
