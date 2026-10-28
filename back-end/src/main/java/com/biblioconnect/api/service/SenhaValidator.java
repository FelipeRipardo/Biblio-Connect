package com.biblioconnect.api.service;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

@Component
public class SenhaValidator {

    //Exige: mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial
    private static final Pattern SENHA_FORTE_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#._-])[A-Za-z\\d@$!%*?&#._-]{8,}$"
    );

    public void validarForcaSenha(String senha) {
        if (senha == null || !SENHA_FORTE_PATTERN.matcher(senha).matches()) {
            throw new IllegalArgumentException(
                    "A senha não atende aos requisitos mínimos de segurança: deve conter pelo menos 8 caracteres, " +
                            "incluindo letra maiúscula, letra minúscula, número e caractere especial (ex: @, #, $, !)."
            );
        }
    }
}