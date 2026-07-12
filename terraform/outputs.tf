output "instance_public_ip" {
  description = "Dirección IP pública de la instancia EC2"
  value       = aws_instance.inscribeme_instance.public_ip
}

output "frontend_url" {
  description = "URL para acceder a la aplicación web (Frontend)"
  value       = "http://${aws_instance.inscribeme_instance.public_ip}:3000"
}

output "api_gateway_url" {
  description = "URL base del API Gateway"
  value       = "http://${aws_instance.inscribeme_instance.public_ip}:8080"
}

output "eureka_url" {
  description = "URL del panel del Servidor de Descubrimiento (Eureka)"
  value       = "http://${aws_instance.inscribeme_instance.public_ip}:8761"
}

output "admin_dashboard_url" {
  description = "URL de Spring Boot Admin Dashboard"
  value       = "http://${aws_instance.inscribeme_instance.public_ip}:8090"
}
