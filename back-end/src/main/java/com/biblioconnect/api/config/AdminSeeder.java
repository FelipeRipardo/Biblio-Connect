package com.biblioconnect.api.config;

import com.biblioconnect.api.domain.Administrador;
import com.biblioconnect.api.domain.enums.Perfil;
import com.biblioconnect.api.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {
        String emailAdmin = "admin@escola.edu.br";

        if (!usuarioRepository.existsByEmail(emailAdmin)) {
            Administrador admin = new Administrador();
            admin.setNome("Administrador do Sistema");
            admin.setEmail(emailAdmin);
            admin.setSenha(passwordEncoder.encode("Admin@123"));
            admin.setPerfil(Perfil.ADMINISTRADOR);

            entityManager.persist(admin);
            System.out.println(">>> [BiblioConnect] Conta ADMINISTRADOR padrão criada: " + emailAdmin + " | Senha: Admin@123");
        }
    }
}
