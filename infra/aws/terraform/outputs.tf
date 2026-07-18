output "s3_bucket_name" {
  description = "Name of the S3 bucket used for frontend hosting"
  value       = aws_s3_bucket.frontend.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "route53_record_fqdn" {
  description = "Route53 alias record FQDN"
  value       = var.domain_name != "" ? aws_route53_record.frontend[0].fqdn : null
}
