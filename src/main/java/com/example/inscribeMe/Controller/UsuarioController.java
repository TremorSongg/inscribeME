package com.example.inscribeMe.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.inscribeMe.Service.UsuarioService;
import com.example.inscribeMe.Model.Usuario;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;




@RestController
@RequestMapping("/v1/usuarios")
@CrossOrigin
public class UsuarioController {
    
    @Autowired
    private UsuarioService serv;

    @PostMapping("/registrar")
    public Usuario registrar(@RequestBody Usuario u) {
        return serv.guardar(u);
    }

    @PostMapping("/login")
    public Map<String,String> login (@RequestBody Usuario u ) {
        Optional<Usuario> user = serv.autenticar(u.getCorreo(), u.getPassword());
        Map<String, String> response = new HashMap<>();
        if (user.isPresent()){
            response.put("result", "OK");
            //convierte id a string
            response.put("id", String.valueOf(user.get().getId()));
            response.put("nombre", user.get().getNombre());
            response.put("correo", user.get().getCorreo());
        } else {
            response.put("result", "Error");
        }
        return response;
    }

    @GetMapping("/listar")
    public List<Usuario> listarUsuario() {
        return serv.obteneUsuarios();
    }
    
    
    
}
