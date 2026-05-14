package com.example.inscribeMe.Model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Roles de usuario que definen los niveles de acceso al sistema")
public enum Rol {
    
    @Schema(description = "Acceso total al sistema, gestión de usuarios y reportes")
    ADMIN, 
    
    @Schema(description = "Usuario capacitado para crear cursos y gestionar sus alumnos")
    INSTRUCTOR, 
    
    @Schema(description = "Usuario con acceso al catálogo y seguimiento de sus propios cursos")
    ESTUDIANTE
}