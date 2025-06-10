package com.example.inscribeMe.Service;

import com.example.inscribeMe.Model.Rol;
import com.example.inscribeMe.Model.Usuario;
import com.example.inscribeMe.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public List<Usuario> obtenerInstructores() {
        // Asumo que tu enum Rol tiene un valor INSTRUCTOR
        return usuarioRepository.findByRol(Rol.INSTRUCTOR);
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Usuario crearUsuario(Usuario usuario) {
        //para no dejar valor rol en null
        if(usuario.getRol()== null){
            usuario.setRol(Rol.ESTUDIANTE);
        }
        //para no dejar valor telefono en null
        if(usuario.getTelefono() == null){
            usuario.setTelefono("");
        }
        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    public Usuario actualizarUsuario(Long id, Usuario datosActualizados) {
        return usuarioRepository.findById(id).map(u -> {
            u.setNombre(datosActualizados.getNombre());
            u.setEmail(datosActualizados.getEmail());
            u.setPassword(datosActualizados.getPassword());
            u.setTelefono(datosActualizados.getTelefono());
            u.setRol(datosActualizados.getRol());
            return usuarioRepository.save(u);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    //Metodo que autentifica a los usuarios 
    public Optional<Usuario> autenticar(String email, String password){
        return usuarioRepository.findByEmail(email).filter(u -> u.getPassword().equals(password));
    }
}
