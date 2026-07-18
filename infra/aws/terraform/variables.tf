variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name for the Angular app"
  type        = string
  default     = "zoieng-ui-prod"
}

variable "project_name" {
  description = "Project short name"
  type        = string
  default     = "zoieng-ui"
}

variable "domain_name" {
  description = "Optional custom domain name for CloudFront and Route53"
  type        = string
  default     = ""
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID for the domain"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS on CloudFront"
  type        = string
  default     = ""
}
