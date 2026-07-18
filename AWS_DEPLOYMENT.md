# AWS Deployment Layout for this Angular App

This repository is a frontend Angular application built as a static SPA. For AWS, the recommended deployment pattern is:

- S3 bucket for hosting the production build
- CloudFront in front of S3 for CDN + HTTPS
- Route 53 + ACM for custom domain
- GitHub Actions for CI/CD build and deploy

## Recommended architecture

```text
Browser
  -> Route 53
  -> CloudFront
  -> S3 bucket (Angular static files)
```

## Build output

The Angular production build uses:

```bash
npm run build:prod
```

The generated static files are placed in:

```text
dist/zoieng-ui/browser
```

## Required AWS resources

1. S3 bucket
   - Host the built static site
   - Enable static website hosting if needed
   - Block public access and use CloudFront OAC for secure delivery

2. CloudFront distribution
   - Origin: the S3 bucket
   - Default root object: index.html
   - Error pages:
     - 403 -> /index.html
     - 404 -> /index.html

3. ACM certificate
   - SSL certificate for the custom domain

4. Route 53
   - Point the custom domain to CloudFront

## CI/CD workflow

A GitHub Actions workflow file has been added at:

- .github/workflows/aws-deploy.yml

It performs the following:

1. Checkout code
2. Install dependencies
3. Run Angular production build
4. Authenticate to AWS with OIDC
5. Upload the built assets to S3
6. Invalidate the CloudFront cache

## GitHub secrets required

Set the following GitHub secret:

- AWS_ROLE_ARN

## Environment variables to change before use

Update the workflow file with:

- AWS_REGION
- S3_BUCKET
- CLOUDFRONT_DISTRIBUTION_ID

## Notes

If your app needs a backend, place it behind:

- API Gateway
- Lambda
- ECS/Fargate

The Angular frontend should use the production API URL from the environment configuration in:

- src/environments/environment.prod.ts
