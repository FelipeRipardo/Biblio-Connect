package com.biblioconnect.api.service;

import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.domain.enums.Perfil;
import com.biblioconnect.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissaoService {

    private final UsuarioRepository usuarioRepository;

    public Usuario validarPermissao(Integer usuarioId, Perfil... perfisPermitidos) {
        if (usuarioId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Acesso restrito: é necessário informar o ID do usuário autenticado no cabeçalho.");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Usuário não encontrado no sistema."));

        List<Perfil> permitidos = Arrays.asList(perfisPermitidos);
        if (!permitidos.contains(usuario.getPerfil())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Acesso negado: o seu perfil (" + usuario.getPerfil() + ") não possui permissão para esta operação. " +
                            "Perfis permitidos: " + permitidos);
        }

        return usuario;
    }

    public void validarAdministrador(Integer adminId) {
        validarPermissao(adminId, Perfil.ADMINISTRADOR);
    }

    public void validarGestorOuAdmin(Integer usuarioId) {
        validarPermissao(usuarioId, Perfil.GESTOR, Perfil.ADMINISTRADOR);
    }
}