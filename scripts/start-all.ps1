# ============================================================
#  InscribeMe - Script de Inicio de Microservicios
#  Uso: .\scripts\start-all.ps1
# ============================================================

$ROOT = Split-Path -Parent $PSScriptRoot

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  InscribeMe - Iniciando Microservicios"      -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

function Start-Svc {
    param([string]$Name, [string]$Dir, [int]$Port, [int]$WaitSec = 5)
    Write-Host ">> Iniciando $Name (puerto $Port)..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/k", "cd /d `"$Dir`" && mvn spring-boot:run" `
        -WorkingDirectory $Dir `
        -WindowStyle Minimized
    Start-Sleep -Seconds $WaitSec
    Write-Host "   OK: $Name iniciado" -ForegroundColor Green
}

# 1. Eureka Server - los demas dependen de el
Start-Svc "Eureka Server"           "$ROOT\eureka-server"           8761  20

# 2. Admin Dashboard
Start-Svc "Admin Dashboard"         "$ROOT\admin-dashboard"         8090   8

# 3. API Gateway
Start-Svc "API Gateway"             "$ROOT\api-gateway"             8080   8

# 4. Microservicios de negocio
Start-Svc "Servicio Usuarios"       "$ROOT\servicio-usuarios"       8081   8
Start-Svc "Servicio Cursos"         "$ROOT\servicio-cursos"         8082   8
Start-Svc "Servicio Inscripciones"  "$ROOT\servicio-inscripciones"  8083   8
Start-Svc "Servicio Carrito"        "$ROOT\servicio-carrito"        8084   8
Start-Svc "Servicio Notificaciones" "$ROOT\servicio-notificaciones" 8085   8
Start-Svc "Servicio Reportes"       "$ROOT\servicio-reportes"       8086   8

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Todos los servicios iniciados"              -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs importantes:" -ForegroundColor White
Write-Host "  Eureka Dashboard  : http://localhost:8761"  -ForegroundColor Yellow
Write-Host "  API Gateway       : http://localhost:8080"  -ForegroundColor Yellow
Write-Host "  Spring Boot Admin : http://localhost:8090"  -ForegroundColor Yellow
Write-Host "  (usuario: admin   contrasena: admin123)"    -ForegroundColor Gray
Write-Host ""
Write-Host "Swagger UI de cada servicio:"                 -ForegroundColor White
Write-Host "  Usuarios          : http://localhost:8081/swagger-ui.html" -ForegroundColor Gray
Write-Host "  Cursos            : http://localhost:8082/swagger-ui.html" -ForegroundColor Gray
Write-Host "  Inscripciones     : http://localhost:8083/swagger-ui.html" -ForegroundColor Gray
Write-Host "  Carrito           : http://localhost:8084/swagger-ui.html" -ForegroundColor Gray
Write-Host "  Notificaciones    : http://localhost:8085/swagger-ui.html" -ForegroundColor Gray
Write-Host "  Reportes          : http://localhost:8086/swagger-ui.html" -ForegroundColor Gray
Write-Host ""
