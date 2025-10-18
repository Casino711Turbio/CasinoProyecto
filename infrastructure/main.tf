    # infrastructure/main.tf
    terraform {
    required_version = ">= 1.0"
    required_providers {
        aws = {
        source  = "hashicorp/aws"
        version = "~> 4.0"
        }
    }

    backend "s3" {
        bucket = "casino-terraform-state"
        key    = "terraform.tfstate"
        region = "us-east-1"
    }
    }

    provider "aws" {
    region = var.aws_region
    }

    module "vpc" {
    source = "./modules/vpc"
    
    environment = var.environment
    vpc_cidr    = var.vpc_cidr
    }

    module "rds" {
    source = "./modules/rds"
    
    environment    = var.environment
    vpc_id         = module.vpc.vpc_id
    subnet_ids     = module.vpc.private_subnets
    db_name        = var.db_name
    db_username    = var.db_username
    db_password    = var.db_password
    }

    module "ecs" {
    source = "./modules/ecs"
    
    environment    = var.environment
    vpc_id         = module.vpc.vpc_id
    subnet_ids     = module.vpc.public_subnets
    backend_image  = var.backend_image
    frontend_image = var.frontend_image
    }

    module "alb" {
    source = "./modules/alb"
    
    environment = var.environment
    vpc_id      = module.vpc.vpc_id
    subnet_ids  = module.vpc.public_subnets
    backend_sg  = module.ecs.backend_sg_id
    }