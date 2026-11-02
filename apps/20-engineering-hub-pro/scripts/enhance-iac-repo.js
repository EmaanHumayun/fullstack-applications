import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IAC_DIR = path.join(__dirname, '..', 'github-ecosystem', 'cloud-infrastructure-iac');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

ensureDir(path.join(IAC_DIR, '.github', 'workflows'));
ensureDir(path.join(IAC_DIR, 'modules', 'vpc'));
ensureDir(path.join(IAC_DIR, 'modules', 'security'));
ensureDir(path.join(IAC_DIR, 'environments', 'dev'));

// .gitignore
fs.writeFileSync(path.join(IAC_DIR, '.gitignore'), `*.tfstate
*.tfstate.*
crash.log
crash.*.log
*.tfvars
!*.tfvars.example
override.tf
override.tf.json
*_override.tf
*_override.tf.json
.terraform/
.terraform.lock.hcl
`);

// VPC Module
fs.writeFileSync(path.join(IAC_DIR, 'modules', 'vpc', 'variables.tf'), `variable "vpc_cidr" {
  type        = string
  description = "The CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  type        = list(string)
  description = "Availability zones to deploy subnets into"
  default     = ["us-east-1a", "us-east-1b"]
}

variable "environment" {
  type        = string
  description = "Deployment environment name"
  default     = "dev"
}
`);

fs.writeFileSync(path.join(IAC_DIR, 'modules', 'vpc', 'main.tf'), `resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "\${var.environment}-vpc"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "\${var.environment}-igw"
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "\${var.environment}-public-subnet-\${count.index + 1}"
    Environment = var.environment
    "kubernetes.io/role/elb" = "1"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name        = "\${var.environment}-public-rt"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
`);

fs.writeFileSync(path.join(IAC_DIR, 'modules', 'vpc', 'outputs.tf'), `output "vpc_id" {
  description = "ID of the provisioned VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}
`);

// Security Module
fs.writeFileSync(path.join(IAC_DIR, 'modules', 'security', 'variables.tf'), `variable "vpc_id" {
  type        = string
  description = "VPC ID where security groups will be attached"
}

variable "environment" {
  type        = string
  description = "Environment identifier"
  default     = "dev"
}
`);

fs.writeFileSync(path.join(IAC_DIR, 'modules', 'security', 'main.tf'), `resource "aws_security_group" "web" {
  name        = "\${var.environment}-web-sg"
  description = "Allow inbound HTTP/HTTPS traffic"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "\${var.environment}-web-security-group"
    Environment = var.environment
  }
}
`);

fs.writeFileSync(path.join(IAC_DIR, 'modules', 'security', 'outputs.tf'), `output "web_security_group_id" {
  description = "The security group ID for web access"
  value       = aws_security_group.web.id
}
`);

// Environments: Dev
fs.writeFileSync(path.join(IAC_DIR, 'environments', 'dev', 'main.tf'), `terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source             = "../../modules/vpc"
  vpc_cidr           = "10.10.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b"]
  environment        = "dev"
}

module "security" {
  source      = "../../modules/security"
  vpc_id      = module.vpc.vpc_id
  environment = "dev"
}
`);

fs.writeFileSync(path.join(IAC_DIR, 'environments', 'dev', 'variables.tf'), `variable "aws_region" {
  type        = string
  description = "Target AWS region"
  default     = "us-east-1"
}
`);

// Example vars
fs.writeFileSync(path.join(IAC_DIR, 'terraform.tfvars.example'), `aws_region  = "us-east-1"
environment = "dev"
vpc_cidr    = "10.0.0.0/16"
`);

// GitHub Actions CI
fs.writeFileSync(path.join(IAC_DIR, '.github', 'workflows', 'terraform-ci.yml'), `name: Terraform Validation & Linting

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  terraform-checks:
    name: Terraform Format & Syntax Validate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.7.0

      - name: Terraform Format Check
        run: terraform fmt -check -recursive

      - name: Initialize & Validate Dev Environment
        working-directory: environments/dev
        run: |
          terraform init -backend=false
          terraform validate
`);

// Commit
try {
  execSync('git add .', { cwd: IAC_DIR });
  execSync('git commit -m "feat(iac): add modular VPC and Security Group Terraform definitions with CI validation"', { cwd: IAC_DIR, stdio: 'inherit' });
  console.log('✅ Successfully enhanced cloud-infrastructure-iac!');
} catch (e) {
  console.log('Git commit notice:', e.message);
}

