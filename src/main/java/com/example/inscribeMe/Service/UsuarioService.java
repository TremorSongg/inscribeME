package com.example.inscribeMe.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.inscribeMe.Model.Usuario;
import com.example.inscribeMe.Repository.UsuarioRepository;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    //obtener todos los usuarios
    public List<Usuario> obteneUsuarios() {
        return usuarioRepository.findAll();
    }

    //buscar usuario por id
    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    //buscar usuario por email
    public Optional<Usuario> bucarPorCorreo(String correo){
        return usuarioRepository.findByCorreo(correo);
    }

    //guardar usuario
    public Usuario guardar (Usuario usuario){
        return usuarioRepository.save(usuario);
    }

    //actualizar un usuario
    public Usuario actualizar (Long id, Usuario usuarioActualizado){
        Optional<Usuario> optionalUsuario = usuarioRepository.findById(id);
        if(optionalUsuario.isPresent()){
            Usuario usuarioExistente = optionalUsuario.get();
            usuarioExistente.setNombre(usuarioActualizado.getNombre());
            usuarioExistente.setCorreo(usuarioActualizado.getCorreo());
            usuarioExistente.setPassword(usuarioActualizado.getPassword());
            return usuarioRepository.save(usuarioExistente);
        } else {
            return null;
        }

    }


    //eliminar un usuario
    public void eliminar(Long id){
        usuarioRepository.deleteById(id);
    }

    //autentificar usuario
    public Optional<Usuario> autenticar (String correo, String password){
        return usuarioRepository.findByCorreo(correo).filter(u -> u.getPassword().equals(password));
    }
}
