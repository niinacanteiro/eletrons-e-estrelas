/* Elétrons e Estrelas · Acessibilidade
   © Nicoly Canteiro Araújo

   O que este arquivo faz:
   1) Aplica as preferências salvas (tamanho do texto, alto contraste, fonte para dislexia,
      links sublinhados, espaçamento maior e pausa das animações) antes da página aparecer,
      para não haver "piscada" de estilo.
   2) Cria o botão flutuante "Acessibilidade" e o painel (diálogo) com as opções.
   3) Lê em voz alta o texto selecionado ou a seção que está na tela (Web Speech API, pt-BR).
   4) Cuida das janelas que já existiam no site (flash card, avaliação, QR code): prende o foco
      dentro delas enquanto estão abertas, devolve o foco ao fechar e esconde o conteúdo
      quando estão fechadas.
   5) Pequenos ajustes automáticos: descrição falada dos controles deslizantes e flash cards
      operáveis pelo teclado.

   Sem dependências: JavaScript puro. Este arquivo é carregado no <head> (sem defer)
   e monta a interface quando o documento termina de carregar. */
(function () {
  'use strict';

  var doc = document;
  var raiz = doc.documentElement;
  var CHAVE = 'ee-acessibilidade';

  /* Passos de tamanho do texto (1 = tamanho original) */
  var ESCALAS = [1, 1.125, 1.25, 1.5, 1.75, 2];

  /* Opções liga/desliga: chave salva -> classe aplicada no <html> */
  var OPCOES = [
    { chave: 'contraste', classe: 'a11y-contraste', rotulo: 'Alto contraste', icone: 'contraste' },
    { chave: 'dislexia', classe: 'a11y-dislexia', rotulo: 'Fonte para dislexia', icone: 'fonte' },
    { chave: 'sublinhar', classe: 'a11y-sublinhar', rotulo: 'Sublinhar links', icone: 'link' },
    { chave: 'espaco', classe: 'a11y-espaco', rotulo: 'Texto espaçado', icone: 'espaco' },
    { chave: 'pausar', classe: 'a11y-pausar', rotulo: 'Pausar animações', icone: 'pausa' }
  ];

  var PADRAO = { escala: 0, contraste: false, dislexia: false, sublinhar: false, espaco: false, pausar: false };
  var prefs = carregar();

  /* ---------- Armazenamento (localStorage pode estar bloqueado: tudo segue funcionando) ---------- */
  function carregar() {
    var p = {};
    for (var k in PADRAO) p[k] = PADRAO[k];
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE) || '{}');
      for (var c in PADRAO) if (salvo && typeof salvo[c] === typeof PADRAO[c]) p[c] = salvo[c];
    } catch (e) { /* sem acesso ao armazenamento: usa o padrão */ }
    p.escala = Math.max(0, Math.min(ESCALAS.length - 1, p.escala | 0));
    return p;
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(prefs)); } catch (e) { /* a escolha vale só nesta visita */ }
  }

  /* ---------- Movimento: preferência do sistema OU botão "Pausar animações" ---------- */
  var mqMovimento = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function parado() { return !!(prefs.pausar || mqMovimento.matches); }
  function avisarMovimento() {
    var ev;
    try { ev = new CustomEvent('ee:movimento', { detail: { parado: parado() } }); }
    catch (e) { ev = doc.createEvent('CustomEvent'); ev.initCustomEvent('ee:movimento', false, false, { parado: parado() }); }
    doc.dispatchEvent(ev);
  }
  if (mqMovimento.addEventListener) mqMovimento.addEventListener('change', avisarMovimento);

  /* ---------- Aplica as preferências no <html> ---------- */
  function carregarFonteDislexia() {
    if (doc.getElementById('a11y-fonte-dislexia')) return;
    var l = doc.createElement('link');
    l.id = 'a11y-fonte-dislexia';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap';
    (doc.head || raiz).appendChild(l);
  }
  function aplicar() {
    OPCOES.forEach(function (o) { raiz.classList.toggle(o.classe, !!prefs[o.chave]); });
    var esc = ESCALAS[prefs.escala];
    raiz.classList.toggle('a11y-escala', esc !== 1);
    raiz.style.setProperty('--a11y-escala', String(esc));
    if (prefs.dislexia) carregarFonteDislexia();
  }
  aplicar();

  /* ---------- Região "ao vivo" para avisos ao leitor de tela ---------- */
  var regiaoAviso = null, timerAviso = 0;
  function anunciar(msg) {
    if (!regiaoAviso) return;
    clearTimeout(timerAviso);
    regiaoAviso.textContent = '';
    /* pequeno atraso: garante que o leitor de tela perceba a mudança mesmo com texto repetido */
    timerAviso = setTimeout(function () { regiaoAviso.textContent = msg; }, 60);
  }

  /* API pública usada pelos outros scripts do site */
  window.EEA11y = { parado: parado, anunciar: anunciar };

  /* ---------- Utilidades de foco ---------- */
  var SEL_FOCAVEL = 'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
  function visivel(el) {
    if (el.closest('[inert]')) return false;
    if (el.checkVisibility) return el.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true });
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }
  function focaveis(box) {
    return [].slice.call(box.querySelectorAll(SEL_FOCAVEL)).filter(visivel);
  }
  /* Mantém o Tab dentro de "box" (diálogo aberto) */
  function prenderFoco(e, box) {
    if (e.key !== 'Tab') return;
    var lista = focaveis(box);
    if (!lista.length) { e.preventDefault(); box.focus(); return; }
    var primeiro = lista[0], ultimo = lista[lista.length - 1], atual = doc.activeElement;
    if (e.shiftKey && (atual === primeiro || !box.contains(atual))) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && (atual === ultimo || !box.contains(atual))) { e.preventDefault(); primeiro.focus(); }
  }
  function focar(el) {
    if (!el) return;
    try { el.focus({ preventScroll: false }); } catch (e) { el.focus(); }
  }

  /* ---------- Ícones (SVG decorativos: aria-hidden) ---------- */
  var ICONES = {
    acesso: '<circle cx="12" cy="4.2" r="2.2"/><path d="M4 8.2c2.7.8 5.3 1.2 8 1.2s5.3-.4 8-1.2l.5 1.9c-2.1.7-4.3 1.1-6.5 1.3v3.1l2.6 7.1-1.9.7L12 15.7l-2.7 6.6-1.9-.7L10 14.5v-3.1c-2.2-.2-4.4-.6-6.5-1.3z"/>',
    contraste: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z"/>',
    fonte: '<path d="M3 19 8.2 5h2.1L15.5 19h-2.3l-1.3-3.7H6.6L5.3 19zm4.3-5.6h3.9L9.3 7.9zM16 19v-1.6c.7.2 1.3.3 1.8.3 1.1 0 1.6-.6 1.6-1.8V9h2.1v7c0 2.3-1.1 3.3-3.4 3.3-.7 0-1.4-.1-2.1-.3z"/>',
    link: '<path d="M10.6 13.4a3.5 3.5 0 0 0 5 0l3.2-3.2a3.5 3.5 0 0 0-5-5l-1.2 1.2 1.4 1.4 1.2-1.2a1.5 1.5 0 0 1 2.2 2.2l-3.2 3.2a1.5 1.5 0 0 1-2.2 0zm2.8-2.8a3.5 3.5 0 0 0-5 0l-3.2 3.2a3.5 3.5 0 0 0 5 5l1.2-1.2-1.4-1.4-1.2 1.2a1.5 1.5 0 0 1-2.2-2.2l3.2-3.2a1.5 1.5 0 0 1 2.2 0zM4 21h16v2H4z"/>',
    espaco: '<path d="M4 5h16v2H4zm0 6h16v2H4zm0 6h16v2H4zM1 4l2 2-2 2zm0 6l2 2-2 2zm0 6l2 2-2 2z"/>',
    pausa: '<path d="M7 5h3.5v14H7zm6.5 0H17v14h-3.5z"/>',
    falar: '<path d="M4 9h4l5-4v14l-5-4H4zm12.5-.8a5 5 0 0 1 0 7.6l-1.3-1.5a3 3 0 0 0 0-4.6zm2.4-2.7a8.6 8.6 0 0 1 0 13l-1.3-1.5a6.6 6.6 0 0 0 0-10z"/>',
    parar: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    fechar: '<path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z"/>'
  };
  function icone(nome) {
    return '<svg class="a11y-ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="currentColor">' + ICONES[nome] + '</svg>';
  }

  /* =====================================================================
     Painel de acessibilidade
     ===================================================================== */
  var botao, painel, saidaEscala, ultimoFoco = null;

  function montarPainel() {
    /* Região de avisos (fica invisível, só para leitores de tela) */
    regiaoAviso = doc.createElement('div');
    regiaoAviso.id = 'a11y-aviso';
    regiaoAviso.className = 'a11y-sr';
    regiaoAviso.setAttribute('role', 'status');
    regiaoAviso.setAttribute('aria-live', 'polite');
    doc.body.appendChild(regiaoAviso);

    /* Botão flutuante */
    botao = doc.createElement('button');
    botao.type = 'button';
    botao.id = 'a11y-botao';
    botao.className = 'a11y-botao';
    botao.setAttribute('aria-haspopup', 'dialog');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-controls', 'a11y-painel');
    botao.innerHTML = icone('acesso') + '<span class="a11y-sr">Acessibilidade: abrir opções</span>';
    doc.body.appendChild(botao);

    /* Painel (diálogo) */
    painel = doc.createElement('div');
    painel.id = 'a11y-painel';
    painel.className = 'a11y-painel';
    painel.setAttribute('role', 'dialog');
    painel.setAttribute('aria-modal', 'true');
    painel.setAttribute('aria-labelledby', 'a11y-titulo');
    painel.setAttribute('aria-describedby', 'a11y-desc');
    painel.tabIndex = -1;
    painel.hidden = true;

    var temVoz = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    var html = '' +
      '<div class="a11y-topo">' +
        '<h2 id="a11y-titulo" class="a11y-titulo">Acessibilidade</h2>' +
        '<button type="button" class="a11y-fechar" data-acao="fechar" aria-label="Fechar opções de acessibilidade">' + icone('fechar') + '</button>' +
      '</div>' +
      '<p id="a11y-desc" class="a11y-desc">Ajuste a leitura do site. Suas escolhas ficam salvas neste navegador.</p>' +

      '<div class="a11y-grupo" role="group" aria-labelledby="a11y-g-texto">' +
        '<h3 id="a11y-g-texto" class="a11y-sub">Tamanho do texto</h3>' +
        '<div class="a11y-linha">' +
          '<button type="button" class="a11y-btn a11y-btn--quadrado" data-acao="menor">A−<span class="a11y-sr"> (diminuir texto)</span></button>' +
          '<output class="a11y-escala" id="a11y-escala-valor" aria-live="polite">100%</output>' +
          '<button type="button" class="a11y-btn a11y-btn--quadrado" data-acao="maior">A+<span class="a11y-sr"> (aumentar texto)</span></button>' +
          '<button type="button" class="a11y-btn" data-acao="restaurar-texto">Restaurar</button>' +
        '</div>' +
      '</div>' +

      '<div class="a11y-grupo" role="group" aria-labelledby="a11y-g-ver">' +
        '<h3 id="a11y-g-ver" class="a11y-sub">Visual e leitura</h3>' +
        '<div class="a11y-grade">' +
          OPCOES.map(function (o) {
            return '<button type="button" class="a11y-btn a11y-alternar" data-opcao="' + o.chave + '" aria-pressed="false">' +
              icone(o.icone) + '<span class="a11y-rotulo">' + o.rotulo + '</span><span class="a11y-chave" aria-hidden="true"></span></button>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="a11y-grupo" role="group" aria-labelledby="a11y-g-voz">' +
        '<h3 id="a11y-g-voz" class="a11y-sub">Leitura em voz alta</h3>' +
        '<p class="a11y-dica" id="a11y-dica-voz">' + (temVoz
          ? 'Selecione um trecho e toque em <strong>Ler em voz alta</strong>. Sem seleção, eu leio a seção que está na tela.'
          : 'Seu navegador não oferece leitura em voz alta. Experimente o Chrome, o Edge ou o Safari.') + '</p>' +
        '<div class="a11y-linha">' +
          '<button type="button" class="a11y-btn" data-acao="ler" aria-describedby="a11y-dica-voz"' + (temVoz ? '' : ' disabled') + '>' + icone('falar') + '<span>Ler em voz alta</span></button>' +
          '<button type="button" class="a11y-btn" data-acao="parar" disabled>' + icone('parar') + '<span>Parar leitura</span></button>' +
        '</div>' +
      '</div>' +

      '<p class="a11y-dica">Libras: use o botão do <strong>VLibras</strong> no canto direito da tela.</p>' +

      '<div class="a11y-rodape">' +
        '<button type="button" class="a11y-btn a11y-btn--secundario" data-acao="restaurar-tudo">Restaurar tudo</button>' +
        '<a class="a11y-link" href="#acessibilidade" data-acao="declaracao">Declaração de acessibilidade</a>' +
      '</div>';
    painel.innerHTML = html;
    doc.body.appendChild(painel);
    saidaEscala = painel.querySelector('#a11y-escala-valor');

    botao.addEventListener('click', function () { painel.hidden ? abrirPainel() : fecharPainel(true); });
    painel.addEventListener('click', aoClicarPainel);
    painel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fecharPainel(true); return; }
      prenderFoco(e, painel);
    });
    /* Clique fora do painel fecha (sem roubar o foco do que foi clicado) */
    doc.addEventListener('pointerdown', function (e) {
      if (!painel.hidden && !painel.contains(e.target) && !botao.contains(e.target)) fecharPainel(false);
    }, true);

    atualizarPainel();
  }

  function abrirPainel() {
    ultimoFoco = doc.activeElement;
    painel.hidden = false;
    botao.setAttribute('aria-expanded', 'true');
    botao.querySelector('.a11y-sr').textContent = 'Acessibilidade: fechar opções';
    /* o foco vai para o próprio diálogo: o leitor de tela anuncia o título e a descrição */
    focar(painel);
  }
  function fecharPainel(devolverFoco) {
    if (painel.hidden) return;
    painel.hidden = true;
    botao.setAttribute('aria-expanded', 'false');
    botao.querySelector('.a11y-sr').textContent = 'Acessibilidade: abrir opções';
    if (devolverFoco) focar(botao);
  }

  function atualizarPainel() {
    if (!painel) return;
    var pct = Math.round(ESCALAS[prefs.escala] * 100) + '%';
    saidaEscala.textContent = pct;
    painel.querySelector('[data-acao="menor"]').disabled = prefs.escala === 0;
    painel.querySelector('[data-acao="maior"]').disabled = prefs.escala === ESCALAS.length - 1;
    [].forEach.call(painel.querySelectorAll('[data-opcao]'), function (b) {
      b.setAttribute('aria-pressed', prefs[b.getAttribute('data-opcao')] ? 'true' : 'false');
    });
  }

  function aoClicarPainel(e) {
    var alvo = e.target.closest('button, a');
    if (!alvo || !painel.contains(alvo)) return;
    var opcao = alvo.getAttribute('data-opcao');
    var acao = alvo.getAttribute('data-acao');
    if (opcao) {
      prefs[opcao] = !prefs[opcao];
      salvar(); aplicar(); atualizarPainel();
      var nome = alvo.querySelector('.a11y-rotulo').textContent;
      anunciar(nome + (prefs[opcao] ? ' ativado' : ' desativado'));
      if (opcao === 'pausar') avisarMovimento();
      return;
    }
    switch (acao) {
      case 'fechar': fecharPainel(true); break;
      case 'menor': mudarEscala(-1); break;
      case 'maior': mudarEscala(1); break;
      case 'restaurar-texto': prefs.escala = 0; salvar(); aplicar(); atualizarPainel(); anunciar('Tamanho do texto restaurado: 100%'); break;
      case 'restaurar-tudo':
        var pausavaAntes = prefs.pausar;
        for (var k in PADRAO) prefs[k] = PADRAO[k];
        salvar(); aplicar(); atualizarPainel(); pararLeitura();
        if (pausavaAntes) avisarMovimento();
        anunciar('Todas as opções de acessibilidade foram restauradas');
        break;
      case 'ler': lerEmVozAlta(); break;
      case 'parar': pararLeitura(); anunciar('Leitura interrompida'); break;
      case 'declaracao':
        e.preventDefault();
        fecharPainel(false);
        var alvoDecl = doc.getElementById('acessibilidade');
        if (alvoDecl) { alvoDecl.scrollIntoView({ block: 'start' }); focar(alvoDecl); }
        break;
    }
  }
  function mudarEscala(passo) {
    var novo = Math.max(0, Math.min(ESCALAS.length - 1, prefs.escala + passo));
    if (novo === prefs.escala) return;
    prefs.escala = novo; salvar(); aplicar(); atualizarPainel();
  }

  /* =====================================================================
     Leitura em voz alta (Web Speech API)
     ===================================================================== */
  var voz = null, selecaoGuardada = '', secaoLida = null;

  function escolherVoz() {
    if (!('speechSynthesis' in window)) return;
    var vozes = window.speechSynthesis.getVoices() || [];
    voz = vozes.filter(function (v) { return /^pt[-_]BR/i.test(v.lang); })[0] ||
          vozes.filter(function (v) { return /^pt/i.test(v.lang); })[0] || null;
  }
  if ('speechSynthesis' in window) {
    escolherVoz();
    if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', escolherVoz);
  }

  /* Guarda o último trecho selecionado na página (o clique no painel pode desfazer a seleção) */
  doc.addEventListener('selectionchange', function () {
    var s = window.getSelection ? String(window.getSelection()) : '';
    var noPainel = painel && doc.activeElement && painel.contains(doc.activeElement);
    if (s.trim()) selecaoGuardada = s.trim();
    else if (!noPainel && painel && painel.hidden) selecaoGuardada = '';
  });

  /* Acha a seção mais visível na tela (ou a que contém o último foco) */
  function secaoAtual() {
    var cand = [].slice.call(doc.querySelectorAll('main .hero, main > section, main .section, footer'));
    if (ultimoFoco && ultimoFoco !== doc.body) {
      var dono = ultimoFoco.closest && ultimoFoco.closest('main .hero, main > section, footer');
      if (dono) return dono;
    }
    var linha = window.innerHeight * 0.35, melhor = null;
    cand.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top <= linha && r.bottom >= linha) melhor = s;
    });
    return melhor || cand[0] || doc.querySelector('main');
  }

  /* Junta o texto visível de um elemento, ignorando o que é decorativo ou oculto */
  function textoVisivel(el) {
    var partes = [];
    var walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentElement;
        if (!p || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (p.closest('script, style, svg, canvas, pre, code, [aria-hidden="true"], [hidden], .a11y-painel')) return NodeFilter.FILTER_REJECT;
        if (p.checkVisibility && !p.checkVisibility({ checkVisibilityCSS: true }) && !p.closest('.a11y-sr')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) partes.push(walker.currentNode.nodeValue.trim());
    return partes.join(' ').replace(/\s+/g, ' ').trim();
  }

  /* Divide em frases curtas: alguns navegadores cortam falas longas */
  function emPedacos(txt) {
    var frases = txt.match(/[^.!?;:]+[.!?;:]*/g) || [txt], out = [], atual = '';
    frases.forEach(function (f) {
      if ((atual + f).length > 220 && atual) { out.push(atual); atual = ''; }
      atual += f;
    });
    if (atual.trim()) out.push(atual);
    return out;
  }

  function marcarLendo(el) {
    if (secaoLida) secaoLida.classList.remove('a11y-lendo');
    secaoLida = el;
    if (el) el.classList.add('a11y-lendo');
  }

  function lerEmVozAlta() {
    if (!('speechSynthesis' in window)) return;
    var sintese = window.speechSynthesis;
    sintese.cancel();
    var texto = selecaoGuardada, origem = 'o trecho selecionado';
    var secao = null;
    if (!texto) {
      secao = secaoAtual();
      texto = secao ? textoVisivel(secao) : '';
      var titulo = secao && secao.querySelector('h1, h2');
      origem = titulo ? 'a seção ' + titulo.textContent.trim() : 'a seção atual';
    }
    if (!texto) { anunciar('Não encontrei texto para ler.'); return; }
    marcarLendo(secao);
    var pedacos = emPedacos(texto);
    var btnParar = painel.querySelector('[data-acao="parar"]');
    btnParar.disabled = false;
    anunciar('Lendo ' + origem);
    pedacos.forEach(function (p, i) {
      var u = new SpeechSynthesisUtterance(p);
      u.lang = 'pt-BR';
      if (voz) u.voice = voz;
      u.rate = 1;
      if (i === pedacos.length - 1) u.onend = function () { btnParar.disabled = true; marcarLendo(null); };
      u.onerror = function () { btnParar.disabled = true; marcarLendo(null); };
      sintese.speak(u);
    });
  }
  function pararLeitura() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    marcarLendo(null);
    if (painel) painel.querySelector('[data-acao="parar"]').disabled = true;
  }

  /* =====================================================================
     Janelas que já existiam no site (flash card, avaliação, QR code)
     Elas abrem e fecham trocando a classe "on". Aqui observamos essa classe.
     ===================================================================== */
  function cuidarDasJanelas() {
    var abertas = [];
    ['fc', 'av', 'av2', 'qr'].forEach(function (id) {
      var fundo = doc.getElementById(id);
      if (!fundo) return;
      var caixa = fundo.querySelector('[role="dialog"]');
      if (!caixa) return;
      caixa.tabIndex = -1;
      var focoAntes = null;

      function sincronizar() {
        var aberto = fundo.classList.contains('on');
        fundo.setAttribute('aria-hidden', aberto ? 'false' : 'true');
        if (aberto) fundo.removeAttribute('inert'); else fundo.setAttribute('inert', '');
        if (aberto && abertas.indexOf(fundo) < 0) {
          abertas.push(fundo);
          focoAntes = doc.activeElement;
          setTimeout(function () { focar(caixa); }, 30);
        } else if (!aberto && abertas.indexOf(fundo) >= 0) {
          abertas.splice(abertas.indexOf(fundo), 1);
          if (fundo.contains(doc.activeElement) || doc.activeElement === doc.body) {
            if (focoAntes && focoAntes !== doc.body && doc.contains(focoAntes)) focar(focoAntes);
          }
          focoAntes = null;
        }
      }
      /* Avaliação enviada: leva o foco à mensagem de agradecimento */
      function concluido() {
        if (!fundo.classList.contains('done')) return;
        var ok = fundo.querySelector('.av-ok');
        if (ok) setTimeout(function () { focar(ok); }, 60);
      }
      /* Flash card: esconde o lado de trás/da frente que não está virado para a pessoa */
      function lados() {
        var frente = fundo.querySelector('.fc-f'), verso = fundo.querySelector('.fc-b');
        if (!frente || !verso) return;
        var virado = fundo.classList.contains('flip');
        var esconder = virado ? frente : verso, mostrar = virado ? verso : frente;
        esconder.setAttribute('inert', ''); esconder.setAttribute('aria-hidden', 'true');
        mostrar.removeAttribute('inert'); mostrar.removeAttribute('aria-hidden');
        if (esconder.contains(doc.activeElement) || doc.activeElement === doc.body) {
          var b = mostrar.querySelector('button');
          if (b && fundo.classList.contains('on')) focar(b);
        }
      }
      var classesAntes = fundo.className;
      new MutationObserver(function () {
        var agora = fundo.className;
        if (agora === classesAntes) return;
        var mudouOn = /\bon\b/.test(agora) !== /\bon\b/.test(classesAntes);
        var mudouDone = /\bdone\b/.test(agora) !== /\bdone\b/.test(classesAntes);
        var mudouFlip = /\bflip\b/.test(agora) !== /\bflip\b/.test(classesAntes);
        classesAntes = agora;
        if (mudouOn) sincronizar();
        if (mudouDone) concluido();
        if (mudouFlip || mudouOn) lados();
      }).observe(fundo, { attributes: true, attributeFilter: ['class'] });

      fundo.addEventListener('keydown', function (e) { if (fundo.classList.contains('on')) prenderFoco(e, caixa); });
      sincronizar();
      lados();
    });
  }

  /* =====================================================================
     Pequenos ajustes automáticos
     ===================================================================== */
  /* Controles deslizantes: o leitor de tela fala o valor formatado (ex.: "10 kΩ") */
  function valoresDosDeslizantes() {
    [].forEach.call(doc.querySelectorAll('input[type="range"]'), function (r) {
      var rotulo = r.id && doc.querySelector('output[for="' + r.id + '"]');
      if (!rotulo) return;
      function atualiza() { r.setAttribute('aria-valuetext', rotulo.textContent.trim()); }
      r.addEventListener('input', function () { setTimeout(atualiza, 0); });
      r.addEventListener('change', function () { setTimeout(atualiza, 0); });
      atualiza();
    });
  }

  /* Quando o conteúdo principal recebe foco pelo link "Pular", não mostra contorno gigante */
  function pularConteudo() {
    var pular = doc.querySelector('.a11y-pular');
    var alvo = doc.getElementById('conteudo');
    if (!pular || !alvo) return;
    pular.addEventListener('click', function (e) {
      e.preventDefault();
      alvo.scrollIntoView({ block: 'start' });
      focar(alvo);
    });
  }

  /* ---------- Início ---------- */
  function iniciar() {
    montarPainel();
    cuidarDasJanelas();
    valoresDosDeslizantes();
    pularConteudo();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
