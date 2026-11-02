package com.biblioconnect.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final SecurityFilter securityFilter;

    //Mapeamento absoluto de todas as variações de rotas que o Swagger utiliza
    private static final String[] SWAGGER_WHITELIST = {
            "/v3/api-docs",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/error"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        //1 - Rotas Públicas (Autenticação, Recuperação de Senha e Documentação Swagger)
                        .requestMatchers(SWAGGER_WHITELIST).permitAll()

                        //2 - Rotas Públicas de Negócio
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/esqueci-senha", "/api/auth/redefinir-senha").permitAll()

                        //3 - Rotas de Gestão de Usuários (Exclusivas do ADMINISTRADOR)
                        .requestMatchers(HttpMethod.POST, "/api/alunos/**", "/api/professores/**", "/api/gestores/**").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PUT, "/api/alunos/**", "/api/professores/**", "/api/gestores/**").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/alunos/**", "/api/professores/**", "/api/gestores/**").hasRole("ADMINISTRADOR")

                        //4 - Consultas (GET) ao acervo e demais rotas exigem apenas estar autenticado com JWT válido
                        .requestMatchers(HttpMethod.POST, "/api/materiais/**").hasAnyRole("GESTOR", "ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PUT, "/api/materiais/**").hasAnyRole("GESTOR", "ADMINISTRADOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/materiais/**").hasAnyRole("GESTOR", "ADMINISTRADOR")

                        //5 - Consultas (GET) ao acervo e demais rotas exigem apenas token JWT válido
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"erro\": \"Não autenticado: envie um token JWT válido no cabeçalho Authorization (Bearer token).\"}");
                        })
                        .accessDeniedHandler((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"erro\": \"Acesso negado: seu perfil não possui permissão para executar esta operação.\"}");
                        })
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
    }

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("Biblio-Connect API")
                        .version("v1.0")
                        .description("Documentação interativa dos endpoints da biblioteca digital."))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}