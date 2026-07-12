variable "aws_region" {
  type        = string
  description = "Región de AWS donde se desplegarán los recursos"
  default     = "us-east-1"
}

variable "instance_type" {
  type        = string
  description = "Tipo de instancia EC2. Se recomienda t3.medium o t3.large para soportar todo el stack de microservicios"
  default     = "t3.medium"
}

variable "key_name" {
  type        = string
  description = "Nombre del Key Pair (par de llaves) registrado en AWS"
  default     = "inscribeme-key"
}

variable "volume_size" {
  type        = number
  description = "Tamaño del disco de la instancia EC2 en GB"
  default     = 20
}

variable "repository_url" {
  type        = string
  description = "URL del repositorio Git de InscribeMe para clonar en el servidor"
  default     = "https://github.com/TremorSongg/inscribeME.git"
}

variable "mysql_root_password" {
  type        = string
  description = "Contraseña root para la base de datos MySQL"
  sensitive   = true
  default     = "RootPassword123!"
}

variable "jwt_secret" {
  type        = string
  description = "Firma secreta para los tokens JWT (mínimo 256 bits)"
  sensitive   = true
  default     = "InscribeMeSuperSecretKeyParaJWT2025ConSuficientesBits256!!"
}

variable "sba_password" {
  type        = string
  description = "Contraseña para el dashboard de Spring Boot Admin (usuario: admin)"
  sensitive   = true
  default     = "AdminPassword123!"
}

variable "use_aws_academy_role" {
  type        = bool
  description = "Si es true, asocia el rol pre-creado LabInstanceProfile de AWS Academy a la instancia EC2"
  default     = true
}
