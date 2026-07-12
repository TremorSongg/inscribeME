terraform {
  required_version = ">= 1.0.0"
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

# ── Redes (VPC y Subred) ──────────────────────────────────────
resource "aws_vpc" "inscribeme_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "inscribeme-vpc"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.inscribeme_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "inscribeme-public-subnet"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.inscribeme_vpc.id

  tags = {
    Name = "inscribeme-igw"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.inscribeme_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "inscribeme-public-rt"
  }
}

resource "aws_route_table_association" "public_rta" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# ── Grupo de Seguridad ─────────────────────────────────────────
resource "aws_security_group" "inscribeme_sg" {
  name        = "inscribeme-sg"
  description = "Permitir trafico necesario para la app InscribeMe"
  vpc_id      = aws_vpc.inscribeme_vpc.id

  # SSH para administración remota
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Frontend de la aplicación (React + Vite)
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # API Gateway (Spring Cloud Gateway)
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Spring Boot Admin Dashboard
  ingress {
    from_port   = 8090
    to_port     = 8090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Eureka Server Dashboard
  ingress {
    from_port   = 8761
    to_port     = 8761
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Tráfico de salida permitido hacia internet
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "inscribeme-sg"
  }
}

# ── AMI de Ubuntu Jammy 22.04 ──────────────────────────────────
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"] # Canonical (dueños de Ubuntu)
}

# ── Instancia EC2 ──────────────────────────────────────────────
resource "aws_instance" "inscribeme_instance" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.inscribeme_sg.id]
  
  # Asociación automática del perfil de instancia de laboratorio de AWS Academy (si se activa)
  iam_instance_profile   = var.use_aws_academy_role ? "LabInstanceProfile" : null

  root_block_device {
    volume_size = var.volume_size
    volume_type = "gp3"
  }

  # Script de inicio (User Data) para configurar la máquina EC2
  user_data = <<-EOF
              #!/bin/bash
              # Actualizar sistema e instalar utilidades básicas
              apt-get update -y
              apt-get install -y apt-transport-https ca-certificates curl software-properties-common git

              # Instalar Docker (usamos amd64 y jammy directamente)
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
              echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu jammy stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
              apt-get update -y
              apt-get install -y docker-ce docker-ce-cli containerd.io

              # Permitir ejecutar docker sin sudo al usuario ubuntu
              usermod -aG docker ubuntu

              # Instalar Docker Compose v2 como plugin de Docker (usando linux-x86_64 directamente)
              mkdir -p /usr/local/lib/docker/cli-plugins
              curl -SL "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64" -o /usr/local/lib/docker/cli-plugins/docker-compose
              chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
              ln -s /usr/local/lib/docker/cli-plugins/docker-compose /usr/bin/docker-compose

              # Configurar 4GB de memoria Swap (Indispensable para levantar todos los microservicios en t3.medium)
              fallocate -l 4G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              # Clonar el código fuente del proyecto
              cd /home/ubuntu
              git clone ${var.repository_url} inscribeme
              cd inscribeme

              # Asegurar permisos del directorio
              chown -R ubuntu:ubuntu /home/ubuntu/inscribeme

              # Crear archivo de variables de entorno (.env) para Docker Compose
              cat << 'ENV' > .env
              MYSQL_ROOT_PASSWORD=${var.mysql_root_password}
              MYSQL_HOST_PORT=3306
              JWT_SECRET=${var.jwt_secret}
              SBA_PASSWORD=${var.sba_password}
              ENV

              # Iniciar los contenedores construyendo las imágenes locales
              docker-compose up -d --build
              EOF

  tags = {
    Name = "inscribeme-server"
  }
}
