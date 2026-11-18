import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { instalarPreviewSeAtivo } from './mocks/servidor';
import './styles/global.css';
import './styles/formulario.css';
import './styles/acesso.css';
import './styles/painel.css';
import './styles/inicio.css';
import './styles/acervo.css';
import './styles/leitura.css';

//Modo de visualização com dados fictícios (/preview), só em desenvolvimento
instalarPreviewSeAtivo();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
