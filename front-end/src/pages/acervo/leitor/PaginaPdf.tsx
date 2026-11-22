import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

interface PaginaPdfProps {
  pdf: PDFDocumentProxy;
  numero: number;
  escala: number;
  base: { largura: number; altura: number }; //Tamanho da 1ª página (escala 1), usado até esta página carregar
  registrar: (numero: number, elemento: HTMLDivElement | null) => void;
}

//Uma página do livro. Só é desenhada quando está perto da área visível, para livros grandes não pesarem.
export function PaginaPdf({ pdf, numero, escala, base, registrar }: PaginaPdfProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);
  const [tamanho, setTamanho] = useState(base);
  const [carregada, setCarregada] = useState(false);

  useEffect(() => {
    registrar(numero, ref.current);
    return () => registrar(numero, null);
  }, [numero, registrar]);

  useEffect(() => {
    const elemento = ref.current!;
    const observador = new IntersectionObserver(([entrada]) => setVisivel(entrada.isIntersecting), {
      root: elemento.closest('.leitor-bib__paginas'),
      rootMargin: '1200px 0px',
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    const destino = tela.current!;
    if (!visivel) {
      //Longe da tela: libera a memória do desenho
      destino.replaceChildren();
      setCarregada(false);
      return;
    }
    let cancelado = false;
    let tarefa: RenderTask | null = null;
    pdf.getPage(numero).then((pagina) => {
      if (cancelado) return;
      const natural = pagina.getViewport({ scale: 1 });
      setTamanho({ largura: natural.width, altura: natural.height });
      //Desenha com a densidade da tela (até 2x) para o texto ficar nítido
      const densidade = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = pagina.getViewport({ scale: escala * densidade });
      //Um canvas novo a cada desenho: o pdf.js não permite dois desenhos no mesmo canvas ao mesmo tempo
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      tarefa = pagina.render({ canvas, viewport });
      tarefa.promise
        .then(() => {
          if (cancelado) return;
          destino.replaceChildren(canvas);
          setCarregada(true);
        })
        .catch(() => undefined); //Desenho cancelado ao trocar o zoom ou rolar para longe
    });
    return () => {
      cancelado = true;
      tarefa?.cancel();
    };
  }, [visivel, escala, pdf, numero]);

  return (
    <div
      ref={ref}
      className="leitor-bib__pagina"
      data-pagina={numero}
      style={{ width: tamanho.largura * escala, height: tamanho.altura * escala }}
      aria-label={`Página ${numero}`}
      role="img"
    >
      <div ref={tela} className="leitor-bib__desenho" />
      {!carregada && <span className="leitor-bib__carregando">Carregando página {numero}...</span>}
    </div>
  );
}
