import { useCallback, useEffect, useState } from 'react';
import { desfavoritar, favoritar, listarFavoritos } from '../api/favoritos';
import { ApiError } from '../api/http';
import type { Favorito } from '../types/api';

//Favoritos do usuário logado, compartilhados pelas telas do acervo (lista, detalhes, leitor e favoritos)
export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<Favorito[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendentes, setPendentes] = useState<Set<number>>(new Set());

  useEffect(() => {
    let ativo = true;
    listarFavoritos()
      .then((lista) => ativo && setFavoritos(lista))
      .catch((err) => {
        if (!ativo) return;
        setFavoritos([]);
        setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar seus favoritos.');
      });
    return () => {
      ativo = false;
    };
  }, []);

  const ehFavorito = useCallback((materialId: number) => !!favoritos?.some((f) => f.material.id === materialId), [favoritos]);

  //Favorita ou remove dos favoritos; a tela é atualizada só depois da resposta do back-end
  const alternar = useCallback(
    async (materialId: number) => {
      if (pendentes.has(materialId)) return;
      setErro(null);
      setPendentes((atual) => new Set(atual).add(materialId));
      try {
        if (ehFavorito(materialId)) {
          await desfavoritar(materialId);
          setFavoritos((atual) => atual?.filter((f) => f.material.id !== materialId) ?? null);
        } else {
          const novo = await favoritar(materialId);
          setFavoritos((atual) => [novo, ...(atual ?? [])]);
        }
      } catch (err) {
        setErro(err instanceof ApiError ? err.message : 'Não foi possível atualizar seus favoritos.');
      } finally {
        setPendentes((atual) => {
          const proximo = new Set(atual);
          proximo.delete(materialId);
          return proximo;
        });
      }
    },
    [ehFavorito, pendentes],
  );

  return { favoritos, erro, ehFavorito, alternar, pendente: (materialId: number) => pendentes.has(materialId) };
}
