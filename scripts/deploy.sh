#!/bin/bash

APP_NAME=lemon-lemonade-editer
BUCKET_NAME=lemon-lemonade-editer
IS_GITHUB=false
DISTRIBUTION_ID=E1WF61MPREFHM0 # lemonade cloudfront

if [[ "$1" != "" ]]; then
    IS_GITHUB=true
fi

# delete origin js, css files
# while IFS= read -r file; do rm ${file}; done < <(find dist/${APP_NAME}/ -type f -name "*.{js|css}")
# rename gzip files to remove .gz extension
# while IFS= read -r file; do mv $file ${file%.gz}; done < <(find dist/${APP_NAME}/ -type f -name "*.gz")

if [ "$IS_GITHUB" = true ] ; then
    echo 'deploy on github'
    # NOTE: 현재는 PROD만 배포
    # sync data to AWS S3
    aws s3 sync dist/${APP_NAME} s3://${BUCKET_NAME} --metadata-directive REPLACE --acl public-read --exclude "index.html" --exclude "*.css" --exclude "*.js" || { echo 'ERROR: s3 sync failed' ; exit 1; }
    # aws s3 sync dist/${APP_NAME} s3://${BUCKET_NAME} --metadata-directive REPLACE --acl public-read --exclude "*" --include "assets/*" || { echo 'ERROR: s3 js/css sync failed' ; exit 1; }
    # aws s3 sync dist/${APP_NAME} s3://${BUCKET_NAME} --metadata-directive REPLACE --acl public-read --exclude "*" --exclude "assets/*" --include "*.css" --include "*.js" --content-encoding gzip || { echo 'ERROR: s3 js/css sync failed' ; exit 1; }
    aws s3 sync dist/${APP_NAME} s3://${BUCKET_NAME} --metadata-directive REPLACE --acl public-read --exclude "*" --exclude "assets/*" --include "*.css" --include "*.js" || { echo 'ERROR: s3 js/css sync failed' ; exit 1; }
    aws s3 cp dist/${APP_NAME}/index.html s3://${BUCKET_NAME}/index.html --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type text/html --acl public-read || { echo 'ERROR: s3 cp index failed' ; exit 1; }
    # aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths '/*'
else
    echo 'deploy on local'
     # NOTE: 현재는 PROD만 배포
    # sync data to AWS S3
    aws s3 --profile lemon sync dist/${APP_NAME} s3://${BUCKET_NAME} --metadata-directive REPLACE --acl public-read --exclude "index.html" --exclude "*.css" --exclude "*.js" || { echo 'ERROR: s3 sync failed' ; exit 1; }
    # aws s3 --profile lemon sync dist/${APP_NAME} s3://${BUCKET_NAME} --metadata-directive REPLACE --acl public-read --exclude "*" --include "assets/*" || { echo 'ERROR: s3 js/css sync failed' ; exit 1; }
    # aws s3 --profile lemon sync dist/${APP_NAME} s3://${BUCKET_NAME} --metadata-directive REPLACE --acl public-read --exclude "*" --exclude "assets/*" --include "*.css" --include "*.js" --content-encoding gzip || { echo 'ERROR: s3 js/css sync failed' ; exit 1; }
    aws s3 --profile lemon sync dist/${APP_NAME} s3://${BUCKET_NAME} --metadata-directive REPLACE --acl public-read --exclude "*" --exclude "assets/*" --include "*.css" --include "*.js" || { echo 'ERROR: s3 js/css sync failed' ; exit 1; }
    aws s3 --profile lemon cp dist/${APP_NAME}/index.html s3://${BUCKET_NAME}/index.html --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type text/html --acl public-read || { echo 'ERROR: s3 cp index failed' ; exit 1; }
    # aws cloudfront --profile lemon create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths '/*'
fi
