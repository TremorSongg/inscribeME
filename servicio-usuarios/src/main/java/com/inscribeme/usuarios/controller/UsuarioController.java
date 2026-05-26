package com.inscribeme.usuarios.controller;

import com.inscribeme.usuarios.model.Usuario;
import com.inscribeme.usuarios.service.UsuarioService;
import com.inscribeme.usuarios.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
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
@Tag(name = "Gestión de Usuarios", description = "Registro, login JWT, perfiles y gestión de instructores")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final JwtUtil jwtUtil;

    @Operation(summary = "Listar todos los usuarios", description = "Uso administrativo")
    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @Operation(summary = "Obtener perfil de usuario", description = "Busca usuario por ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuario(
            @Parameter(description = "ID del usuario", example = "1") @PathVariable Long id) {
        return usuarioService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Registrar nuevo usuario", description = "Crea un nuevo perfil en el sistema")
    @ApiResponse(responseCode = "200", description = "Registro exitoso")
    @PostMapping("/registrar")
    public ResponseEntity<Usuario> crearUsuario(@RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.crearUsuario(usuario));
    }

    @Operation(summary = "Login con JWT", description = "Valida credenciales y devuelve un token JWT + datos del usuario")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Autenticación exitosa"),
        @ApiResponse(responseCode = "401", description = "Credenciales incorrectas", content = @Content)
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Credenciales de acceso",
        content = @Content(examples = @ExampleObject(
            value = "{ \"email\": \"usuario@example.com\", \"password\": \"123456\" }"
        ))
    )
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        return usuarioService.autenticar(email, password)
                .map(usuario -> {
                    String token = jwtUtil.generateToken(
                            usuario.getId(),
                            usuario.getEmail(),
                            usuario.getRol().name()
                    );
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", token);
                    response.put("id", usuario.getId());
                    response.put("nombre", usuario.getNombre());
                    response.put("email", usuario.getEmail());
                    response.put("rol", usuario.getRol().name());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> error = new HashMap<>();
                    error.put("result", "FAIL");
                    error.put("message", "Credenciales inválidas");
                    return ResponseEntity.status(401).body(error);
                });
    }

    @Operation(summary = "Actualizar perfil", description = "Modifica los datos de un usuario existente")
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, usuario));
    }

    @Operation(summary = "Eliminar cuenta", description = "Borra permanentemente el perfil de un usuario")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Listar instructores", description = "Obtiene usuarios con rol de instructor")
    @GetMapping("/instructores")
    public List<Usuario> getInstructores() {
        return usuarioService.obtenerInstructores();
    }
}
