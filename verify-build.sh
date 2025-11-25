#!/bin/bash

# Script to verify build output structure
echo "Checking build output structure..."
echo ""

if [ ! -d "dist" ]; then
    echo "❌ dist folder not found. Run 'npm run build' first."
    exit 1
fi

echo "✅ dist folder exists"
echo ""

# Check for index.html
if [ -f "dist/index.html" ]; then
    echo "✅ index.html exists"
else
    echo "❌ index.html not found"
fi

# Check for assets folder
if [ -d "dist/assets" ]; then
    echo "✅ assets folder exists"
    echo ""
    echo "Assets in dist/assets/:"
    ls -lh dist/assets/ | tail -n +2 | awk '{print "  - " $9 " (" $5 ")"}'
else
    echo "❌ assets folder not found"
fi

echo ""
echo "📋 Files to upload to S3:"
echo "  - dist/index.html"
echo "  - dist/assets/ (entire folder)"
if [ -f "dist/vite.svg" ]; then
    echo "  - dist/vite.svg"
fi

echo ""
echo "⚠️  Important: Make sure to upload the entire 'assets' folder to S3!"
echo "   The image paths in the built code reference './assets/logo-*.png'"

