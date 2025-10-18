    resource "aws_ecs_cluster" "casino_cluster" {
    name = "casino-cluster-${var.environment}"
    }

    resource "aws_ecs_task_definition" "backend" {
    family                   = "backend-${var.environment}"
    network_mode             = "awsvpc"
    requires_compatibilities = ["FARGATE"]
    cpu                      = 256
    memory                   = 512
    execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

    container_definitions = jsonencode([{
        name  = "backend"
        image = var.backend_image
        portMappings = [{
        containerPort = 8000
        hostPort      = 8000
        }]
        environment = [
        { name = "DB_HOST", value = var.db_host },
        { name = "DB_NAME", value = var.db_name },
        { name = "DB_USER", value = var.db_username },
        { name = "DB_PASSWORD", value = var.db_password },
        { name = "DEBUG", value = "False" }
        ]
    }])
    }

    resource "aws_ecs_service" "backend" {
    name            = "backend-${var.environment}"
    cluster         = aws_ecs_cluster.casino_cluster.id
    task_definition = aws_ecs_task_definition.backend.arn
    desired_count   = 2
    launch_type     = "FARGATE"

    network_configuration {
        subnets          = var.subnet_ids
        security_groups  = [aws_security_group.backend_sg.id]
        assign_public_ip = true
    }

    load_balancer {
        target_group_arn = var.backend_target_group_arn
        container_name   = "backend"
        container_port   = 8000
    }
    }