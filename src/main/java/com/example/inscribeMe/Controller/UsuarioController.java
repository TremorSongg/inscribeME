package com.example.inscribeMe.Controller;

import com.example.inscribeMe.Model.Usuario;
import com.example.inscribeMe.Service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
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

    //login que no me funciona:c
    // @PostMapping("/login")
    // public Map<String, String> login(@RequestBody Usuario u) {
    //     Optional<Usuario> user = usuarioService.autenticar(u.getEmail(), u.getPassword());
    //     Map<String, String> response = new HashMap<>();
    //     if (user.isPresent()) {
    //         response.put("result", "OK");
    //         response.put("id", String.valueOf(user.get().getId())); // Convertir ID a String
    //         response.put("nombre", user.get().getNombre());
    //         response.put("email", user.get().getEmail());
    //     } else {
    //         response.put("result", "Error");
    //     }
    //     return response;
    // }

    @PutMapping("/{id}")
    public Usuario actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        return usuarioService.actualizarUsuario(id, usuario);
    }

    @DeleteMapping("/{id}")
    public void eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
    }
}
