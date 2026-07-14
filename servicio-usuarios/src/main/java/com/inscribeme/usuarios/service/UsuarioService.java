package com.inscribeme.usuarios.service;

import com.inscribeme.usuarios.exception.EmailAlreadyExistsException;
import com.inscribeme.usuarios.model.Rol;
import com.inscribeme.usuarios.model.Usuario;
import com.inscribeme.usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RestTemplate restTemplate;

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findByEliminadoFalse();
    }

    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findByIdAndEliminadoFalse(id);
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
        usuario.setEliminado(false);
        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(Long id) {
        Usuario u = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));

        // Block if the user has active inscriptions
        try {
            Object[] inscripciones = restTemplate.getForObject(
                "http://SERVICIO-INSCRIPCIONES/api/inscripciones/usuario/" + id, Object[].class);
            if (inscripciones != null && inscripciones.length > 0) {
                throw new IllegalStateException(
                    "No se puede eliminar al usuario '" + u.getNombre() + "' porque tiene "
                    + inscripciones.length + " inscripción(es) activa(s). "
                    + "Primero cancele sus inscripciones a cursos.");
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException(
                "No se pudo verificar las inscripciones del usuario '" + u.getNombre()
                + "'. Verifique que el servicio de inscripciones esté activo e intente nuevamente.");
        }

        // Block if the instructor has active courses assigned
        if (u.getRol() == Rol.INSTRUCTOR) {
            try {
                Object[] cursos = restTemplate.getForObject(
                    "http://SERVICIO-CURSOS/api/cursos/instructor/" + id, Object[].class);
                if (cursos != null && cursos.length > 0) {
                    throw new IllegalStateException(
                        "No se puede eliminar al instructor '" + u.getNombre() + "' porque tiene "
                        + cursos.length + " curso(s) activo(s) asignado(s). "
                        + "Primero reasigne o elimine sus cursos.");
                }
            } catch (IllegalStateException e) {
                throw e;
            } catch (Exception e) {
                throw new IllegalStateException(
                    "No se pudo verificar los cursos del instructor '" + u.getNombre()
                    + "'. Verifique que el servicio de cursos esté activo e intente nuevamente.");
            }
        }

        // Cascade cleanup (best-effort — do not block deletion if these fail)
        try { restTemplate.delete("http://SERVICIO-CARRITO/api/carrito/vaciar?usuarioId=" + id); } catch (Exception ignored) {}
        try { restTemplate.delete("http://SERVICIO-NOTIFICACIONES/api/notificaciones/usuario/" + id); } catch (Exception ignored) {}

        u.setEliminado(true);
        usuarioRepository.save(u);
    }

    public Usuario actualizarUsuario(Long id, Usuario datosActualizados) {
        return usuarioRepository.findByIdAndEliminadoFalse(id).map(u -> {
            if (datosActualizados.getEmail() != null && !u.getEmail().equalsIgnoreCase(datosActualizados.getEmail())) {
                if (usuarioRepository.findByEmail(datosActualizados.getEmail()).isPresent()) {
                    throw new EmailAlreadyExistsException("El correo ya está registrado");
                }
            }
            if (datosActualizados.getNombre() != null) {
                u.setNombre(datosActualizados.getNombre());
            }
            if (datosActualizados.getEmail() != null) {
                u.setEmail(datosActualizados.getEmail());
            }
            if (datosActualizados.getPassword() != null && !datosActualizados.getPassword().isBlank()) {
                u.setPassword(datosActualizados.getPassword());
            }
            if (datosActualizados.getTelefono() != null) {
                u.setTelefono(datosActualizados.getTelefono());
            }
            if (datosActualizados.getRol() != null) {
                u.setRol(datosActualizados.getRol());
            }
            if (datosActualizados.getFotoPerfil() != null) {
                u.setFotoPerfil(datosActualizados.getFotoPerfil());
            }
            return usuarioRepository.save(u);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    public Optional<Usuario> autenticar(String email, String password) {
        return usuarioRepository.findByEmailAndEliminadoFalse(email)
                .filter(u -> u.getPassword().equals(password));
    }

    public List<Usuario> obtenerInstructores() {
        return usuarioRepository.findByRolAndEliminadoFalse(Rol.INSTRUCTOR);
    }
}
