#!/bin/bash
set -e

BUCKET="sudokustack-sudokubucket36098364-srfkqwiydxtg"
DISTRIBUTION_ID="E2ECPVPI4K69FJ"

echo "Deploying Sudoku to S3..."
aws s3 sync . s3://$BUCKET --delete --exclude ".git/*" --exclude "node_modules/*" --exclude "*.sh"

echo "Setting default root object..."
aws cloudfront update-distribution --id $DISTRIBUTION_ID --default-root-object index.html > /dev/null

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" > /dev/null

echo "Done! https://d8n3t128pkdmm.cloudfront.net"
