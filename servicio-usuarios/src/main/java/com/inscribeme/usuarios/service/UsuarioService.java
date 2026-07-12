package com.inscribeme.usuarios.service;

import com.inscribeme.usuarios.exception.EmailAlreadyExistsException;
import com.inscribeme.usuarios.model.Rol;
import com.inscribeme.usuarios.model.Usuario;
import com.inscribeme.usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Usuario crearUsuario(Usuario usuario) {
        if (usuario.getEmail() != null && usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("El correo ya está registrado");
        }
        if (usuario.getRol() == null) {
            usuario.setRol(Rol.ESTUDIANTE);
        }
        if (usuario.getTelefono() == null) {
            usuario.setTelefono("");
        }
        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    public Usuario actualizarUsuario(Long id, Usuario datosActualizados) {
        return usuarioRepository.findById(id).map(u -> {
            if (datosActualizados.getEmail() != null && !u.getEmail().equalsIgnoreCase(datosActualizados.getEmail())) {
                if (usuarioRepository.findByEmail(datosActualizados.getEmail()).isPresent()) {
                    throw new EmailAlreadyExistsException("El correo ya está registrado");
                }
            }
            u.setNombre(datosActualizados.getNombre());
            u.setEmail(datosActualizados.getEmail());
            if (datosActualizados.getPassword() != null && !datosActualizados.getPassword().isBlank()) {
                u.setPassword(datosActualizados.getPassword());
            }
            u.setTelefono(datosActualizados.getTelefono());
            u.setRol(datosActualizados.getRol());
            return usuarioRepository.save(u);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    public Optional<Usuario> autenticar(String email, String password) {
        return usuarioRepository.findByEmail(email)
                .filter(u -> u.getPassword().equals(password));
    }

    public List<Usuario> obtenerInstructores() {
        return usuarioRepository.findByRol(Rol.INSTRUCTOR);
    }
}
