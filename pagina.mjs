/**
 * Modelo da página (HTML). Os dados vêm de site.config.mjs — aqui fica só a estrutura.
 * Recebe o "contexto" montado por scripts/build.mjs.
 */
import { esc } from './util.mjs';
import { icone, spriteIcones, limparIconesUsados } from './icones.mjs';

const NOVA_ABA = '<span class="sr">(abre em nova aba)</span>';
const ICONE_SERVICO = { banho: 'chuveiro', tosa: 'tesoura', estetica: 'brilho' };

/** Atributos de link externo (abre em nova aba com segurança). */
const externo = 'target="_blank" rel="noopener"';

export function renderizarPagina(ctx) {
  const { config: c } = ctx;
  limparIconesUsados();
  // O corpo é montado antes para saber quais ícones entram no sprite.
  const corpo = `<a class="pular" href="#conteudo">Pular para o conteúdo</a>
${topo(ctx)}
<main id="conteudo" tabindex="-1">
${hero(ctx)}
${servicos(ctx)}
${diferenciais(ctx)}
${galeria(ctx)}
${comoAgendar(ctx)}
${avaliacoes(ctx)}
${sobre(ctx)}
${faq(ctx)}
${contato(ctx)}
${chamadaFinal(ctx)}
</main>
${rodape(ctx)}
${botaoFlutuante(ctx)}`;
  return `<!doctype html>
<html lang="${esc(c.site.idioma)}">
<head>
${cabecaHtml(ctx)}
</head>
<body>
${spriteIcones()}
${corpo}
</body>
</html>
`;
}

/* ------------------------------------------------------------------ <head> */

function cabecaHtml(ctx) {
  const { config: c, urlAbsoluta } = ctx;
  const linhas = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${esc(c.site.titulo)}</title>`,
    `<meta name="description" content="${esc(c.site.descricao)}">`,
    `<meta name="theme-color" content="${esc(c.cores.fundoLogo)}">`,
    '<meta name="format-detection" content="telephone=no">',
  ];
  if (urlAbsoluta) linhas.push(`<link rel="canonical" href="${esc(urlAbsoluta(''))}">`);
  linhas.push(
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="pt_BR">',
    `<meta property="og:site_name" content="${esc(c.negocio.nome)}">`,
    `<meta property="og:title" content="${esc(c.site.titulo)}">`,
    `<meta property="og:description" content="${esc(c.site.descricao)}">`,
  );
  if (urlAbsoluta) {
    linhas.push(
      `<meta property="og:url" content="${esc(urlAbsoluta(''))}">`,
      `<meta property="og:image" content="${esc(urlAbsoluta('assets/icones/og-imagem.jpg'))}">`,
      '<meta property="og:image:width" content="1200">',
      '<meta property="og:image:height" content="630">',
      `<meta property="og:image:alt" content="${esc(`Logotipo do ${c.negocio.nome}`)}">`,
      '<meta name="twitter:card" content="summary_large_image">',
    );
  }
  linhas.push(
    '<link rel="icon" href="favicon.ico" sizes="32x32">',
    `<link rel="icon" href="${esc(c.marca.favicon)}" type="image/svg+xml">`,
    '<link rel="apple-touch-icon" href="assets/icones/apple-touch-icon.png">',
    '<link rel="manifest" href="site.webmanifest">',
    ...ctx.fontes.map(
      (f) => `<link rel="preload" href="${esc(f)}" as="font" type="font/woff2" crossorigin>`,
    ),
    `<style>${ctx.css}</style>`,
    // Sem JavaScript: o menu do celular fica sempre visível (não depende do botão).
    '<noscript><style>.nav{display:block!important;position:static!important;visibility:visible!important;opacity:1!important;transform:none!important}.topo__menu{display:none!important}</style></noscript>',
    `<script src="${esc(ctx.js)}" defer></script>`,
    `<script type="application/ld+json">${ctx.jsonLd}</script>`,
  );
  return linhas.join('\n');
}

/* ------------------------------------------------------------------ blocos */

function botaoWhatsApp(ctx, { mensagem, rotulo = 'Agendar pelo WhatsApp', classe = 'botao--primario', extraSr = '' }) {
  return `<a class="botao ${classe}" href="${esc(ctx.wa(mensagem))}" ${externo}>${icone('whatsapp')}<span>${esc(rotulo)}</span>${extraSr ? `<span class="sr">${esc(extraSr)}</span>` : ''}${NOVA_ABA}</a>`;
}

function botaoMapa(ctx, classe = 'botao--contorno') {
  return `<a class="botao ${classe}" href="${esc(ctx.mapa.link)}" ${externo}>${icone('navegacao')}<span>Ver localização</span>${NOVA_ABA}</a>`;
}

function cabecaSecao({ id, sobretitulo, titulo, texto = '', classe = '' }) {
  return `<header class="secao__cabeca ${classe}">
      <p class="sobretitulo">${icone('patinha')}<span>${esc(sobretitulo)}</span></p>
      <h2 id="${id}">${esc(titulo)}</h2>
      ${texto ? `<p class="secao__texto">${esc(texto)}</p>` : ''}
    </header>`;
}

/** Telhado com chaminé do logotipo, usado como detalhe decorativo. */
function telhado(classe) {
  return `<svg class="${classe}" aria-hidden="true" focusable="false" viewBox="40 60 530 265" fill="currentColor"><path d="M50.53 294.86L321.12 67.69L565.42 311.57L557.49 319.52L319.8 82.24L57.14 302.75Z"/><path d="M431 185.31L465.78 220.04L535.73 149.96L500.94 115.24Z"/></svg>`;
}

function seloIlustrativa(foto) {
  return foto.ilustrativa ? '<span class="selo-foto">Foto ilustrativa</span>' : '';
}

/* ------------------------------------------------------------------ seções */

function topo(ctx) {
  const { config: c } = ctx;
  const links = ctx.menu.map((m) => `<li><a href="${m.href}">${esc(m.rotulo)}</a></li>`).join('');
  return `<header class="topo" data-topo>
  <div class="container topo__barra">
    <a class="topo__marca" href="#inicio"><img src="${esc(c.marca.logoHorizontal)}" alt="${esc(c.negocio.nome)} — início" width="${ctx.logoHorizontal.largura}" height="${ctx.logoHorizontal.altura}"></a>
    <button class="topo__menu" type="button" aria-expanded="false" aria-controls="menu-principal" data-menu-botao>
      <span class="topo__menu-abrir">${icone('menu')}<span class="sr">Abrir menu</span></span>
      <span class="topo__menu-fechar">${icone('fechar')}<span class="sr">Fechar menu</span></span>
    </button>
    <nav class="nav" id="menu-principal" aria-label="Principal" data-menu>
      <ul class="nav__lista">${links}</ul>
      ${botaoWhatsApp(ctx, { mensagem: 'agendar', classe: 'botao--primario nav__cta' })}
    </nav>
  </div>
</header>`;
}

function hero(ctx) {
  const { config: c } = ctx;
  const t = c.textos;
  const f = c.fotos.hero;
  return `<section class="hero" id="inicio" aria-labelledby="hero-titulo">
  <div class="container hero__grade">
    <div class="hero__texto">
      <p class="sobretitulo sobretitulo--claro">${icone('patinha')}<span>${esc(t.heroSobretitulo)}</span></p>
      <h1 id="hero-titulo">${esc(t.heroTitulo)}</h1>
      <p class="hero__sub">${esc(t.heroSubtitulo)}</p>
      <div class="acoes">
        ${botaoWhatsApp(ctx, { mensagem: 'hero', classe: 'botao--primario botao--grande' })}
        <a class="botao botao--contorno-claro botao--grande" href="#servicos"><span>Conhecer nossos serviços</span>${icone('setaDireita')}</a>
      </div>
      <ul class="hero__fatos">
        <li>${icone('pin')}<span>${esc(ctx.endereco.rua)} — ${esc(c.negocio.endereco.bairro)}</span></li>
        <li>${icone('patinha')}<span>Cães e gatos</span></li>
      </ul>
    </div>
    <figure class="hero__foto">
      ${telhado('hero__telhado')}
      <div class="hero__moldura">
        ${ctx.foto(f, { sizes: '(min-width: 1200px) 520px, (min-width: 900px) 42vw, 92vw', prioridade: true })}
        ${seloIlustrativa(f)}
      </div>
    </figure>
  </div>
</section>`;
}

function servicos(ctx) {
  const { config: c } = ctx;
  const cards = c.servicos
    .map((s) => {
      const f = c.fotos[s.foto];
      return `<li class="servico">
        <div class="servico__foto">
          ${ctx.foto(f, { sizes: '(min-width: 1200px) 370px, (min-width: 760px) 31vw, 92vw' })}
          ${seloIlustrativa(f)}
        </div>
        <div class="servico__corpo">
          <span class="servico__icone">${icone(ICONE_SERVICO[s.icone] || s.icone)}</span>
          <h3>${esc(s.titulo)}</h3>
          <p>${esc(s.descricao)}</p>
          ${botaoWhatsApp(ctx, { mensagem: s.mensagem, rotulo: 'Consultar pelo WhatsApp', classe: 'botao--escuro', extraSr: `: ${s.titulo}` })}
        </div>
      </li>`;
    })
    .join('\n      ');
  const acessorios = c.acessorios?.exibir
    ? `<div class="acessorios">
      <span class="acessorios__icone">${icone('sacola')}</span>
      <p>${esc(c.acessorios.texto)}</p>
      <a class="link-seta" href="${esc(ctx.wa('acessorios'))}" ${externo}><span>Perguntar sobre acessórios</span>${icone('setaDireita')}${NOVA_ABA}</a>
    </div>`
    : '';
  return `<section class="secao secao--clara" id="servicos" aria-labelledby="servicos-titulo">
  <div class="container">
    ${cabecaSecao({
      id: 'servicos-titulo',
      sobretitulo: 'Serviços',
      titulo: 'Banho, tosa e estética para cães e gatos',
      texto: 'Escolha o serviço e consulte valores e disponibilidade diretamente pelo WhatsApp.',
    })}
    <ul class="servicos">
      ${cards}
    </ul>
    ${acessorios}
  </div>
</section>`;
}

function diferenciais(ctx) {
  const { config: c } = ctx;
  if (!c.diferenciais?.length) return '';
  const f = c.fotos.porQue;
  const itens = c.diferenciais
    .map(
      (d) => `<li class="diferencial">
          <span class="diferencial__icone">${icone(d.icone)}</span>
          <div><h3>${esc(d.titulo)}</h3><p>${esc(d.texto)}</p></div>
        </li>`,
    )
    .join('\n        ');
  return `<section class="secao secao--escura" id="por-que" aria-labelledby="por-que-titulo">
  <div class="container porque">
    <figure class="porque__foto">
      ${ctx.foto(f, { sizes: '(min-width: 900px) 44vw, 92vw' })}
      ${seloIlustrativa(f)}
    </figure>
    <div class="porque__texto">
      ${cabecaSecao({ id: 'por-que-titulo', sobretitulo: 'Por que escolher', titulo: `Por que escolher o ${c.negocio.nome}`, classe: 'secao__cabeca--esquerda' })}
      <ul class="diferenciais">
        ${itens}
      </ul>
      ${botaoWhatsApp(ctx, { mensagem: 'agendar', classe: 'botao--primario' })}
    </div>
  </div>
</section>`;
}

function galeria(ctx) {
  const { config: c } = ctx;
  const fotos = c.fotos.galeria || [];
  if (!fotos.length) return '';
  const algumaIlustrativa = fotos.some((f) => f.ilustrativa);
  const itens = fotos
    .map(
      (f) => `<li><figure class="galeria__item">
        ${ctx.foto(f, { sizes: '(min-width: 1000px) 280px, (min-width: 640px) 31vw, 46vw' })}
        ${f.legenda ? `<figcaption>${esc(f.legenda)}</figcaption>` : ''}
      </figure></li>`,
    )
    .join('\n      ');
  return `<section class="secao" id="galeria" aria-labelledby="galeria-titulo">
  <div class="container">
    ${cabecaSecao({
      id: 'galeria-titulo',
      sobretitulo: 'Galeria',
      titulo: 'Inspiração para o visual do seu pet',
      texto: 'Banho, tosa e estética para cães e gatos. Conte pelo WhatsApp como você gostaria que seu pet ficasse.',
    })}
    <ul class="galeria">
      ${itens}
    </ul>
    ${algumaIlustrativa ? '<p class="nota">Fotos ilustrativas de banco de imagens. Os créditos estão no rodapé.</p>' : ''}
  </div>
</section>`;
}

function comoAgendar(ctx) {
  const { config: c } = ctx;
  const passos = c.comoAgendar
    .map(
      (p, i) => `<li class="passo">
        <span class="passo__numero" aria-hidden="true">${i + 1}</span>
        <span class="passo__icone">${icone(p.icone)}</span>
        <h3><span class="sr">Passo ${i + 1}: </span>${esc(p.titulo)}</h3>
        <p>${esc(p.texto)}</p>
      </li>`,
    )
    .join('\n      ');
  return `<section class="secao secao--clara" id="como-agendar" aria-labelledby="como-agendar-titulo">
  <div class="container">
    ${cabecaSecao({
      id: 'como-agendar-titulo',
      sobretitulo: 'Como agendar',
      titulo: 'Agendar é simples',
      texto: `Todo o atendimento é combinado diretamente com o ${c.negocio.nome} pelo WhatsApp.`,
    })}
    <ol class="passos">
      ${passos}
    </ol>
    <div class="acoes acoes--centro">
      ${botaoWhatsApp(ctx, { mensagem: 'comoAgendar', classe: 'botao--primario botao--grande' })}
    </div>
    <p class="nota nota--centro">O site não faz reservas automáticas: valores, disponibilidade e horário são confirmados pelo estabelecimento.</p>
  </div>
</section>`;
}

function avaliacoes(ctx) {
  const lista = ctx.config.avaliacoes || [];
  if (!lista.length) return ''; // sem avaliações reais, a seção não aparece
  const itens = lista
    .map(
      (a) => `<li><figure class="avaliacao">
        <blockquote><p>${esc(a.texto)}</p></blockquote>
        <figcaption>${esc(a.autor)}${a.origem ? ` · ${a.link ? `<a href="${esc(a.link)}" ${externo}>${esc(a.origem)}${NOVA_ABA}</a>` : esc(a.origem)}` : ''}</figcaption>
      </figure></li>`,
    )
    .join('\n      ');
  return `<section class="secao" id="avaliacoes" aria-labelledby="avaliacoes-titulo">
  <div class="container">
    ${cabecaSecao({ id: 'avaliacoes-titulo', sobretitulo: 'Avaliações', titulo: 'O que dizem os clientes' })}
    <ul class="avaliacoes">
      ${itens}
    </ul>
  </div>
</section>`;
}

function sobre(ctx) {
  const { config: c } = ctx;
  const paragrafos = c.textos.sobre.map((p) => `<p>${esc(p)}</p>`).join('\n      ');
  return `<section class="secao" id="sobre" aria-labelledby="sobre-titulo">
  <div class="container sobre">
    <div class="sobre__marca">
      <img src="${esc(c.marca.logo)}" alt="Logotipo do ${esc(c.negocio.nome)}" width="${ctx.logo.largura}" height="${ctx.logo.altura}" loading="lazy" decoding="async">
    </div>
    <div class="sobre__texto">
      ${cabecaSecao({ id: 'sobre-titulo', sobretitulo: 'Sobre', titulo: `Sobre o ${c.negocio.nome}`, classe: 'secao__cabeca--esquerda' })}
      ${paragrafos}
      <div class="acoes">
        ${botaoWhatsApp(ctx, { mensagem: 'contato', rotulo: 'Falar pelo WhatsApp', classe: 'botao--escuro' })}
        ${botaoMapa(ctx, 'botao--contorno')}
      </div>
    </div>
  </div>
</section>`;
}

function acaoFaq(ctx, acao) {
  if (!acao) return '';
  if (acao.tipo === 'whatsapp') {
    return `<a class="link-seta" href="${esc(ctx.wa(acao.mensagem))}" ${externo}><span>${esc(acao.rotulo)}</span>${icone('setaDireita')}${NOVA_ABA}</a>`;
  }
  if (acao.tipo === 'mapa') {
    return `<a class="link-seta" href="${esc(ctx.mapa.link)}" ${externo}><span>${esc(acao.rotulo)}</span>${icone('setaDireita')}${NOVA_ABA}</a>`;
  }
  return `<a class="link-seta" href="${esc(acao.href)}"><span>${esc(acao.rotulo)}</span>${icone('setaDireita')}</a>`;
}

function faq(ctx) {
  const { config: c } = ctx;
  if (!c.faq?.length) return '';
  const itens = c.faq
    .map(
      (q) => `<details class="faq__item">
        <summary><span>${esc(q.pergunta)}</span>${icone('setaBaixo', { classe: 'ico faq__seta' })}</summary>
        <div class="faq__resposta">
          <p>${esc(q.resposta)}</p>
          ${acaoFaq(ctx, q.acao)}
        </div>
      </details>`,
    )
    .join('\n      ');
  return `<section class="secao secao--clara" id="duvidas" aria-labelledby="duvidas-titulo">
  <div class="container container--estreito">
    ${cabecaSecao({ id: 'duvidas-titulo', sobretitulo: 'Dúvidas', titulo: 'Perguntas frequentes' })}
    <div class="faq">
      ${itens}
    </div>
  </div>
</section>`;
}

function contato(ctx) {
  const { config: c } = ctx;
  const n = c.negocio;
  const horarios = n.horarios?.length
    ? `<ul class="horarios">${n.horarios.map((h) => `<li><span>${esc(h.dias)}</span><span>${esc(h.horas)}</span></li>`).join('')}</ul>`
    : '<p>Consulte o horário de atendimento pelo WhatsApp.</p>';
  const instagram = ctx.instagram
    ? `<li class="contato__linha">
          <span class="contato__icone">${icone('instagram')}</span>
          <div><h3>Instagram</h3><p><a href="${esc(ctx.instagram.url)}" ${externo}>${esc(ctx.instagram.rotulo)}${NOVA_ABA}</a></p></div>
        </li>`
    : '';
  const mapaTitulo = `Mapa: ${n.nome}, ${ctx.endereco.rua}, ${n.endereco.bairro}, ${n.endereco.cidade}`;
  const mapa = c.mapa.carregarAutomaticamente
    ? `<iframe class="mapa__iframe" title="${esc(mapaTitulo)}" src="${esc(ctx.mapa.embed)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`
    : `<div class="mapa__aviso" data-mapa-aviso>
          ${icone('mapa', { classe: 'ico mapa__icone' })}
          <p class="mapa__titulo">Mapa da localização</p>
          <p>Para ver o mapa aqui, toque no botão. O mapa é do Google Maps e só é carregado depois do seu clique.</p>
          <button class="botao botao--primario" type="button" data-mapa-botao data-src="${esc(ctx.mapa.embed)}" data-titulo="${esc(mapaTitulo)}">${icone('pin')}<span>Mostrar mapa</span></button>
        </div>`;
  return `<section class="secao" id="contato" aria-labelledby="contato-titulo">
  <div class="container">
    ${cabecaSecao({ id: 'contato-titulo', sobretitulo: 'Contato', titulo: 'Localização e contato' })}
    <div class="contato">
      <div class="contato__cartao">
        <ul class="contato__lista">
          <li class="contato__linha">
            <span class="contato__icone">${icone('pin')}</span>
            <div><h3>Endereço</h3><address>${esc(ctx.endereco.rua)}<br>${esc(n.endereco.bairro)}, ${esc(n.endereco.cidade)} — ${esc(n.endereco.uf)}<br>CEP ${esc(n.endereco.cep)}</address></div>
          </li>
          <li class="contato__linha">
            <span class="contato__icone">${icone('whatsapp')}</span>
            <div><h3>WhatsApp e telefone</h3><p><a href="${esc(ctx.wa('contato'))}" ${externo}>${esc(n.whatsapp.exibicao)}<span class="sr"> no WhatsApp</span>${NOVA_ABA}</a></p></div>
          </li>
          <li class="contato__linha">
            <span class="contato__icone">${icone('relogio')}</span>
            <div><h3>Horário de atendimento</h3>${horarios}</div>
          </li>
          ${instagram}
        </ul>
        <div class="acoes">
          ${botaoWhatsApp(ctx, { mensagem: 'contato', rotulo: 'Falar pelo WhatsApp', classe: 'botao--primario' })}
          ${botaoMapa(ctx, 'botao--contorno')}
          <a class="botao botao--contorno" href="tel:${esc(n.telefone.numero)}">${icone('telefone')}<span>Ligar</span></a>
        </div>
      </div>
      <div class="mapa" data-mapa>
        ${mapa}
      </div>
    </div>
  </div>
</section>`;
}

function chamadaFinal(ctx) {
  const t = ctx.config.textos;
  return `<section class="chamada" aria-labelledby="chamada-titulo">
  <div class="container chamada__caixa">
    ${telhado('chamada__telhado')}
    <h2 id="chamada-titulo">${esc(t.chamadaFinalTitulo)}</h2>
    <p>${esc(t.chamadaFinalTexto)}</p>
    ${botaoWhatsApp(ctx, { mensagem: 'agendar', classe: 'botao--escuro botao--grande' })}
  </div>
</section>`;
}

function rodape(ctx) {
  const { config: c } = ctx;
  const n = c.negocio;
  const links = ctx.menu.map((m) => `<li><a href="${m.href}">${esc(m.rotulo)}</a></li>`).join('');
  const creditos = ctx.creditos.length
    ? `<details class="creditos">
      <summary>Créditos das fotos</summary>
      <p>As fotos do site são ilustrativas, de banco de imagens, e não mostram o estabelecimento nem pets atendidos por ele.</p>
      <ul>${ctx.creditos.map((cr) => `<li>${esc(cr.descricao)} — foto de <a href="${esc(cr.url)}" ${externo}>${esc(cr.autor)}${NOVA_ABA}</a> (${esc(cr.fonte)}, <a href="${esc(cr.licencaUrl)}" ${externo}>${esc(cr.licenca)}${NOVA_ABA}</a>)</li>`).join('')}</ul>
    </details>`
    : '';
  const instagram = ctx.instagram
    ? `<li><a href="${esc(ctx.instagram.url)}" ${externo}>${icone('instagram')}<span>Instagram</span>${NOVA_ABA}</a></li>`
    : '';
  return `<footer class="rodape">
  <div class="container rodape__grade">
    <div class="rodape__marca">
      <img src="${esc(c.marca.logo)}" alt="${esc(n.nome)}" width="${ctx.logo.largura}" height="${ctx.logo.altura}" loading="lazy" decoding="async">
      <p>${esc(n.categoria)}.</p>
    </div>
    <div>
      <h2 class="rodape__titulo">Contato</h2>
      <ul class="rodape__lista">
        <li>${icone('pin')}<span>${esc(ctx.endereco.rua)}<br>${esc(ctx.endereco.bairroCidade)}<br>CEP ${esc(n.endereco.cep)}</span></li>
        <li><a href="${esc(ctx.wa('contato'))}" ${externo}>${icone('whatsapp')}<span>WhatsApp: ${esc(n.whatsapp.exibicao)}</span>${NOVA_ABA}</a></li>
        <li><a href="tel:${esc(n.telefone.numero)}">${icone('telefone')}<span>Telefone: ${esc(n.telefone.exibicao)}</span></a></li>
        ${instagram}
      </ul>
    </div>
    <nav aria-label="Rodapé">
      <h2 class="rodape__titulo">Navegação</h2>
      <ul class="rodape__lista rodape__lista--links">${links}</ul>
    </nav>
  </div>
  <div class="container rodape__base">
    <p>© <span data-ano>${ctx.ano}</span> ${esc(n.nome)}. Todos os direitos reservados.</p>
    ${creditos}
  </div>
</footer>`;
}

function botaoFlutuante(ctx) {
  return `<aside aria-label="Atalho para o WhatsApp"><a class="wa-flutuante" href="${esc(ctx.wa('flutuante'))}" ${externo}>${icone('whatsapp')}<span class="wa-flutuante__texto">WhatsApp</span><span class="sr">: falar com o ${esc(ctx.config.negocio.nome)}</span>${NOVA_ABA}</a></aside>`;
}
