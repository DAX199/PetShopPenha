/*
 * Pet Shop Penha — comportamento da página.
 * O site funciona sem JavaScript; este arquivo só melhora a experiência:
 *  - menu do celular (abrir/fechar, tecla Esc, foco);
 *  - sombra do cabeçalho ao rolar;
 *  - destaque do item do menu da seção visível;
 *  - mapa do Google carregado somente após o clique;
 *  - ano atual no rodapé.
 */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var topo = document.querySelector('[data-topo]');
  var botaoMenu = document.querySelector('[data-menu-botao]');
  var menu = document.querySelector('[data-menu]');
  var desktop = window.matchMedia('(min-width: 1000px)');

  /* ---------- menu do celular ---------- */
  function menuAberto() {
    return botaoMenu && botaoMenu.getAttribute('aria-expanded') === 'true';
  }

  function abrirMenu() {
    botaoMenu.setAttribute('aria-expanded', 'true');
    raiz.classList.add('menu-aberto');
    var primeiro = menu.querySelector('a');
    if (primeiro) primeiro.focus();
  }

  function fecharMenu(devolverFoco) {
    if (!menuAberto()) return;
    botaoMenu.setAttribute('aria-expanded', 'false');
    raiz.classList.remove('menu-aberto');
    if (devolverFoco) botaoMenu.focus();
  }

  if (botaoMenu && menu) {
    botaoMenu.addEventListener('click', function () {
      if (menuAberto()) fecharMenu(false);
      else abrirMenu();
    });

    // Fecha ao escolher um link do menu.
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) fecharMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuAberto()) fecharMenu(true);
    });

    // Fecha ao tocar fora do cabeçalho.
    document.addEventListener('click', function (e) {
      if (menuAberto() && !topo.contains(e.target)) fecharMenu(false);
    });

    // Mantém o foco dentro do menu aberto (botão + links).
    topo.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !menuAberto()) return;
      var focaveis = [botaoMenu].concat(Array.prototype.slice.call(menu.querySelectorAll('a')));
      var primeiro = focaveis[0];
      var ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    });

    // Ao passar para a tela grande, o menu de celular é desfeito.
    var aoMudarTela = function () {
      if (desktop.matches) fecharMenu(false);
    };
    if (desktop.addEventListener) desktop.addEventListener('change', aoMudarTela);
    else if (desktop.addListener) desktop.addListener(aoMudarTela);
  }

  /* ---------- sombra do cabeçalho ---------- */
  if (topo) {
    var marcarRolagem = function () {
      topo.classList.toggle('topo--rolado', window.scrollY > 8);
    };
    window.addEventListener('scroll', marcarRolagem, { passive: true });
    marcarRolagem();
  }

  /* ---------- item do menu da seção visível ---------- */
  if ('IntersectionObserver' in window && menu) {
    var links = {};
    Array.prototype.forEach.call(menu.querySelectorAll('a[href^="#"]'), function (a) {
      links[a.getAttribute('href').slice(1)] = a;
    });
    var secoes = Object.keys(links)
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);
    var visiveis = {};
    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (en) {
          visiveis[en.target.id] = en.isIntersecting;
        });
        var atual = null;
        for (var i = 0; i < secoes.length; i++) {
          if (visiveis[secoes[i].id]) {
            atual = secoes[i].id;
            break;
          }
        }
        Object.keys(links).forEach(function (id) {
          if (id === atual) links[id].setAttribute('aria-current', 'true');
          else links[id].removeAttribute('aria-current');
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    secoes.forEach(function (s) {
      observador.observe(s);
    });
  }

  /* ---------- mapa sob demanda ---------- */
  var botaoMapa = document.querySelector('[data-mapa-botao]');
  if (botaoMapa) {
    botaoMapa.addEventListener('click', function () {
      var caixa = botaoMapa.closest('[data-mapa]');
      var iframe = document.createElement('iframe');
      iframe.className = 'mapa__iframe';
      iframe.src = botaoMapa.getAttribute('data-src');
      iframe.title = botaoMapa.getAttribute('data-titulo') || 'Mapa';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.setAttribute('allowfullscreen', '');
      caixa.innerHTML = '';
      caixa.appendChild(iframe);
      iframe.focus();
    });
  }

  /* ---------- ano no rodapé ---------- */
  var ano = document.querySelector('[data-ano]');
  if (ano) ano.textContent = String(new Date().getFullYear());
})();
