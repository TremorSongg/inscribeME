package com.example.inscribeMe.Controller;

import com.example.inscribeMe.Model.Usuario;
import com.example.inscribeMe.Service.UsuarioService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Permite solicitudes desde cualquier origen
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @GetMapping("/{id}")
    public Usuario obtenerUsuario(@PathVariable Long id) {
        return usuarioService.obtenerPorId(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @PostMapping("/registrar")
    public Usuario crearUsuario(@RequestBody Usuario usuario) {
        return usuarioService.crearUsuario(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        return usuarioService.autenticar(email, password)
                .map(usuario -> {
                    // Si la autenticación es exitosa, preparamos una respuesta OK.
                    Map<String, Object> response = new HashMap<>();
                    response.put("result", "OK");
                    response.put("id", usuario.getId());
                    response.put("nombre", usuario.getNombre());
                    response.put("email", usuario.getEmail());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    // Si falla, preparamos una respuesta de error.
                    Map<String, Object> response = new HashMap<>();
                    response.put("result", "FAIL");
                    response.put("message", "Credenciales inválidas");
                    return ResponseEntity.status(401).body(response); // 401 Unauthorized
                });
    }

    @PutMapping("/{id}")
    public Usuario actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        return usuarioService.actualizarUsuario(id, usuario);
    }

    @DeleteMapping("/{id}")
    public void eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
    }

    @GetMapping("/instructores")
    public List<Usuario> getInstructores() {
        return usuarioService.obtenerInstructores();
    }
}
