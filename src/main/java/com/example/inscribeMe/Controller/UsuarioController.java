package com.example.inscribeMe.Controller;

import com.example.inscribeMe.Model.Usuario;
import com.example.inscribeMe.Service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Gestión de Usuarios", description = "Operaciones de registro, perfil, autenticación y gestión de instructores")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Operation(summary = "Listar todos los usuarios", description = "Retorna una lista completa de usuarios registrados (Uso administrativo)")
    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @Operation(summary = "Obtener perfil de usuario", description = "Busca los datos de un usuario por su identificador único")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content)
    })
    @GetMapping("/{id}")
    public Usuario obtenerUsuario(
            @Parameter(description = "ID del usuario", example = "1") @PathVariable Long id) {
        return usuarioService.obtenerPorId(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Operation(summary = "Registrar nuevo usuario", description = "Crea un nuevo perfil en el sistema")
    @ApiResponse(responseCode = "200", description = "Registro exitoso")
    @PostMapping("/registrar")
    public Usuario crearUsuario(@RequestBody Usuario usuario) {
        return usuarioService.crearUsuario(usuario);
    }

    @Operation(summary = "Autenticación (Login)", description = "Valida las credenciales y devuelve los datos básicos del usuario")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Autenticación exitosa"),
        @ApiResponse(responseCode = "401", description = "Credenciales incorrectas", content = @Content)
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Credenciales de acceso",
        content = @Content(
            examples = @ExampleObject(value = "{ \"email\": \"usuario@example.com\", \"password\": \"123456\" }")
        )
    )
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        return usuarioService.autenticar(email, password)
                .map(usuario -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("result", "OK");
                    response.put("id", usuario.getId());
                    response.put("nombre", usuario.getNombre());
                    response.put("email", usuario.getEmail());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("result", "FAIL");
                    response.put("message", "Credenciales inválidas");
                    return ResponseEntity.status(401).body(response);
                });
    }

    @Operation(summary = "Actualizar perfil", description = "Modifica los datos de un usuario existente")
    @PutMapping("/{id}")
    public Usuario actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        return usuarioService.actualizarUsuario(id, usuario);
    }

    @Operation(summary = "Eliminar cuenta", description = "Borra permanentemente el perfil de un usuario")
    @DeleteMapping("/{id}")
    public void eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
    }

    @Operation(summary = "Listar instructores", description = "Obtiene exclusivamente la lista de usuarios con rol de instructor")
    @GetMapping("/instructores")
    public List<Usuario> getInstructores() {
        return usuarioService.obtenerInstructores();
    }
}