#!/bin/zsh
echo "Changing package permissions to 755"
chmod -R 755 package/
echo "Emptying s3 bucket"
aws s3 rm s3://www.alisonanders.com --recursive
echo "Moving Files to S3"
aws s3 sync package/ s3://www.alisonanders.com
echo "Setting Cache-Control headers"
aws s3 cp s3://www.alisonanders.com/ s3://www.alisonanders.com/ --exclude "*" --include "*.css" --include "*.js" --include "*.svg" --include "*.jpg" --include "*.png" --recursive --metadata-directive REPLACE --expires 2034-01-01T00:00:00Z --acl public-read --cache-control max-age=2592000,public
echo "Invalidating cloudfront distribution"
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
echo "Done"

# /bin/zsh deploy.sh