# AWS Infrastructure Layout

This folder contains a simple Terraform template for deploying the Angular frontend to AWS with:

- S3 for static hosting
- CloudFront for CDN and HTTPS
- Route53 + ACM for custom domain support

## Files

- provider.tf
- variables.tf
- main.tf
- outputs.tf

## Example usage

```bash
cd infra/aws/terraform
terraform init
terraform plan
terraform apply
```

## Important notes

- Set a globally unique S3 bucket name.
- Supply a valid ACM certificate ARN if using a custom domain.
- Provide Route53 hosted zone ID if you want the domain alias record created automatically.
- The Angular build output to upload is:

```text
dist/zoieng-ui/browser
```
