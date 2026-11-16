/* Elétrons e Estrelas — flash cards, quizzes e laboratórios do motor
   © 2026 Nicoly Canteiro Araújo · JavaScript puro, sem dependências */
(function () {
  "use strict";

  /* ================= BANCO DE FLASH CARDS ================= */
  var DECKS = {
    fundamentos: { nome: "Fundamentos de circuitos", cards: [
      ["O que é corrente elétrica?", "É a taxa com que a carga atravessa uma seção do condutor: i = dq/dt. Unidade: ampère (A) = coulomb por segundo."],
      ["O que é tensão elétrica?", "É a energia necessária para levar uma unidade de carga de um ponto a outro: v = dw/dq. Unidade: volt (V) = joule por coulomb."],
      ["Como se calcula a potência de um elemento?", "p = v · i. Pela convenção passiva, p > 0 significa que o elemento absorve energia; p < 0, que fornece."],
      ["Enuncie a Lei de Ohm.", "Num resistor linear, a tensão é proporcional à corrente: v = R · i. R é a resistência, em ohms (Ω)."],
      ["De que depende a resistência de um fio?", "R = ρ · L / A: cresce com a resistividade ρ do material e com o comprimento L, e diminui com a área A da seção."],
      ["O que diz a Lei de Kirchhoff das Correntes (LKC)?", "A soma das correntes que entram num nó é igual à soma das que saem. É a conservação da carga."],
      ["O que diz a Lei de Kirchhoff das Tensões (LKT)?", "A soma algébrica das tensões numa malha fechada é zero. É a conservação da energia."],
      ["Resistência equivalente em série?", "Soma direta: Req = R1 + R2 + … + Rn. A corrente é a mesma em todos."],
      ["Resistência equivalente em paralelo?", "1/Req = 1/R1 + 1/R2 + … Para dois resistores: Req = R1·R2/(R1+R2). A tensão é a mesma em todos."],
      ["Fórmula do divisor de tensão?", "Com R1 e R2 em série sob V: a tensão em R2 é V2 = V · R2/(R1+R2)."]
    ]},
    rc: { nome: "Circuito RC", cards: [
      ["O que é a constante de tempo τ de um circuito RC?", "τ = R · C, em segundos. Mede a rapidez da carga e da descarga do capacitor."],
      ["Quanto o capacitor carrega após 1τ?", "Cerca de 63,2% da tensão da fonte, porque 1 − e⁻¹ ≈ 0,632."],
      ["Após quanto tempo se considera o capacitor carregado?", "Em 5τ ele atinge cerca de 99,3% da tensão final; na prática, considera-se o regime permanente."],
      ["Equação da tensão na carga?", "v_C(t) = V_s · (1 − e^(−t/τ))."],
      ["Equação da tensão na descarga?", "v_C(t) = V_0 · e^(−t/τ), em que V_0 é a tensão inicial do capacitor."],
      ["Como o capacitor se comporta em regime permanente CC?", "Como um circuito aberto: a corrente cai a zero e toda a tensão fica sobre ele."],
      ["Energia armazenada num capacitor?", "W = ½ · C · V². Ela fica no campo elétrico entre as placas."],
      ["Por que a tensão do capacitor não pode saltar instantaneamente?", "Porque i = C · dv/dt: um salto de tensão exigiria corrente infinita."]
    ]},
    interpolacao: { nome: "Interpolação quadrática", cards: [
      ["O que é interpolar?", "Estimar o valor de uma função entre pontos conhecidos usando uma função mais simples (aqui, um polinômio) que passa por eles."],
      ["Quantos pontos definem uma parábola única?", "Três pontos com abscissas distintas definem um único polinômio de grau ≤ 2."],
      ["Forma de Lagrange do polinômio de grau 2?", "P(x) = y0·L0(x) + y1·L1(x) + y2·L2(x), com L0 = (x−x1)(x−x2)/((x0−x1)(x0−x2)) e análogos."],
      ["Qual o risco de extrapolar?", "Fora do intervalo dos pontos o erro pode crescer muito, porque nada garante que a função real siga a parábola."],
      ["Como é o erro da interpolação quadrática?", "E(x) = f'''(ξ)/3! · (x−x0)(x−x1)(x−x2), para algum ξ no intervalo dos pontos."],
      ["Que sistema linear gera os coeficientes a, b, c?", "O sistema de Vandermonde: a·xi² + b·xi + c = yi, para i = 0, 1, 2."]
    ]},
    motor: { nome: "Motor de indução gaiola de esquilo", cards: [
      ["Por que o motor se chama ‘de indução’?", "Porque o rotor não recebe corrente por fios: a corrente nele é induzida pelo campo girante do estator, pela Lei de Faraday."],
      ["O que é a ‘gaiola de esquilo’?", "O enrolamento do rotor: barras de alumínio ou cobre nas ranhuras, curto-circuitadas por dois anéis nas pontas. Sem as chapas, parece uma roda de hamster."],
      ["Fórmula da velocidade síncrona?", "n_s = 120 · f / p, em rpm, com f em hertz e p o número de polos. Em 60 Hz e 4 polos: 1800 rpm."],
      ["O que é escorregamento?", "A diferença relativa entre a velocidade do campo e a do rotor: s = (n_s − n)/n_s. Em carga nominal costuma ficar entre 1% e 6%."],
      ["Por que o rotor nunca alcança a velocidade síncrona?", "Se girasse junto com o campo, não haveria variação de fluxo nas barras, logo nem tensão induzida, nem corrente, nem torque."],
      ["Qual a frequência das correntes do rotor?", "f_r = s · f. Com s = 3% em 60 Hz, f_r = 1,8 Hz."],
      ["Como a potência do entreferro se divide no rotor?", "Uma fração s vira perda Joule no rotor (s·P_ef) e o restante, (1−s)·P_ef, vira potência mecânica."],
      ["Como o torque depende da tensão?", "O torque é aproximadamente proporcional ao quadrado da tensão: com 90% da tensão, o torque cai para cerca de 81%."],
      ["Para que serve o pacote de chapas de aço-silício?", "Conduzir bem o fluxo magnético e, por ser laminado e isolado, reduzir as correntes parasitas (de Foucault) e as perdas no ferro."],
      ["Para onde vão as perdas do motor?", "Todas viram calor (1ª lei da termodinâmica) e saem por condução até a carcaça, convecção forçada pelo ventilador e radiação."],
      ["O que indica a classe de isolamento F?", "Que o sistema isolante suporta até 155 °C no ponto mais quente. Classe B: 130 °C; H: 180 °C."],
      ["Como inverter o sentido de giro?", "Trocando duas das três fases da alimentação: o campo girante passa a girar ao contrário."],
      ["Por que a partida estrela-triângulo reduz a corrente?", "Na ligação estrela cada bobina recebe a tensão de linha dividida por √3; corrente e torque de partida caem para cerca de 1/3."],
      ["Como o inversor de frequência controla a velocidade?", "Variando f (e a tensão junto, mantendo V/f quase constante para preservar o fluxo), muda a velocidade síncrona n_s = 120f/p."]
    ]},
    arduino: { nome: "Arduino e sensores", cards: [
      ["Como calcular o resistor de um LED no Arduino?", "R = (V_cc − V_f)/I. Com 5 V, LED vermelho de 2 V e 20 mA: 150 Ω; usa-se o valor comercial acima, 220 Ω."],
      ["Como o HC-SR04 mede distância?", "Emite um pulso ultrassônico e mede o tempo t do eco. A distância é d = v·t/2 (ida e volta), com v ≈ 343 m/s a 20 °C."],
      ["Atalho para o HC-SR04 em centímetros?", "d (cm) ≈ t (µs) / 58, que já embute a velocidade do som e a divisão por 2."],
      ["O que fazem setup() e loop()?", "setup() roda uma vez ao ligar (configura pinos); loop() repete para sempre a lógica principal."],
      ["Para que serve o pinMode()?", "Define se um pino digital é entrada (INPUT, INPUT_PULLUP) ou saída (OUTPUT)."],
      ["Qual a diferença entre digitalWrite e analogWrite?", "digitalWrite põe o pino em 0 ou 5 V; analogWrite gera PWM (0 a 255), uma onda quadrada cuja razão cíclica simula tensões médias."]
    ]},
    ceu: { nome: "Astronomia", cards: [
      ["O que é um ano-luz?", "A distância que a luz percorre no vácuo em um ano: cerca de 9,46 trilhões de km. É unidade de distância, não de tempo."],
      ["De onde vem a energia do Sol?", "Da fusão nuclear de hidrogênio em hélio no núcleo; a massa que ‘some’ vira energia, segundo E = mc²."],
      ["Por que vemos fases da Lua?", "Porque, ao longo do mês, vemos de ângulos diferentes a metade da Lua iluminada pelo Sol."],
      ["O que é uma nebulosa?", "Uma nuvem de gás e poeira interestelar; algumas são berçários onde nascem estrelas."],
      ["Qual a relação entre elétrons e a luz das estrelas?", "Quando elétrons dos átomos mudam de nível de energia, emitem ou absorvem fótons de frequências bem definidas: são as linhas do espectro, que revelam a composição das estrelas."]
    ]}
  };

  /* ================= BANCO DE QUIZZES ================= */
  // [pergunta, [alternativas], índice correto, explicação]
  var QUIZ = {
    fundamentos: [
      ["Um resistor de 220 Ω recebe 5 V. Qual a corrente?", ["≈ 2,3 mA", "≈ 22,7 mA", "≈ 44 mA", "1,1 A"], 1, "i = V/R = 5/220 ≈ 0,0227 A = 22,7 mA."],
      ["Dois resistores de 10 kΩ em paralelo equivalem a:", ["20 kΩ", "10 kΩ", "5 kΩ", "2,5 kΩ"], 2, "Iguais em paralelo: R/2 = 5 kΩ."],
      ["A Lei de Kirchhoff das Correntes expressa a conservação de:", ["energia", "carga", "momento", "potência reativa"], 1, "Carga não se acumula no nó: o que entra, sai."],
      ["Uma lâmpada de 60 W em 127 V puxa aproximadamente:", ["0,47 A", "2,1 A", "7,6 kA", "60 A"], 0, "i = P/V = 60/127 ≈ 0,47 A."],
      ["Num divisor com R1 = 1 kΩ e R2 = 2 kΩ sob 9 V, a tensão em R2 é:", ["3 V", "4,5 V", "6 V", "9 V"], 2, "V2 = 9 · 2/(1+2) = 6 V."]
    ],
    rc: [
      ["R = 10 kΩ e C = 100 µF. Quanto vale τ?", ["0,1 s", "1 s", "10 s", "100 s"], 1, "τ = 10 000 · 100×10⁻⁶ = 1 s."],
      ["Após 1τ de carga, o capacitor está com cerca de:", ["37% de V_s", "50% de V_s", "63% de V_s", "99% de V_s"], 2, "1 − e⁻¹ ≈ 0,632."],
      ["Em regime permanente CC, o capacitor ideal age como:", ["curto-circuito", "circuito aberto", "fonte de corrente", "resistor de R ohms"], 1, "Sem variação de tensão, i = C·dv/dt = 0."],
      ["Ao dobrar R mantendo C, o tempo de carga:", ["cai pela metade", "não muda", "dobra", "quadruplica"], 2, "τ = RC é proporcional a R."],
      ["Durante a carga completa a partir de zero, a energia dissipada no resistor é:", ["zero", "igual à energia guardada no capacitor", "o dobro da guardada", "metade da guardada"], 1, "A fonte entrega C·V²; metade fica no capacitor (½CV²) e metade vira calor no resistor, qualquer que seja R."]
    ],
    interpolacao: [
      ["Por que o método exige x0, x1 e x2 distintos?", ["para o gráfico ficar bonito", "senão os denominadores de Lagrange zeram", "porque Python não aceita repetidos", "não exige"], 1, "Os termos (xi − xj) aparecem no denominador; abscissas iguais tornam o sistema singular."],
      ["Os pontos (0,1), (1,3), (2,7) geram P(x) =", ["x² + x + 1", "2x + 1", "x² + 2", "3x² − x + 1"], 0, "Confira: P(0)=1, P(1)=3, P(2)=7."],
      ["Usando esse P(x), quanto vale P(1,5)?", ["4,25", "4,75", "5,0", "5,25"], 1, "1,5² + 1,5 + 1 = 2,25 + 1,5 + 1 = 4,75."],
      ["Onde o erro da interpolação tende a ser maior?", ["nos próprios pontos", "no meio do intervalo", "fora do intervalo (extrapolação)", "o erro é sempre zero"], 2, "O fator (x−x0)(x−x1)(x−x2) cresce rápido fora do intervalo."]
    ],
    motor: [
      ["Motor de 4 polos em 60 Hz: velocidade síncrona?", ["900 rpm", "1200 rpm", "1800 rpm", "3600 rpm"], 2, "n_s = 120·60/4 = 1800 rpm."],
      ["Esse motor gira a 1746 rpm em carga. O escorregamento é:", ["0,3%", "3%", "5,4%", "30%"], 1, "s = (1800 − 1746)/1800 = 0,03 = 3%."],
      ["Com s = 3% em 60 Hz, a frequência das correntes no rotor é:", ["0,18 Hz", "1,8 Hz", "18 Hz", "60 Hz"], 1, "f_r = s·f = 0,03 · 60 = 1,8 Hz."],
      ["Potência no entreferro de 10 kW com s = 4%. A perda Joule no rotor é:", ["40 W", "400 W", "4 kW", "9,6 kW"], 1, "P_Cu2 = s·P_ef = 0,04 · 10 000 = 400 W; os outros 9,6 kW viram potência mecânica."],
      ["Se a tensão cai 10%, o torque disponível fica perto de:", ["90%", "81%", "70%", "100%"], 1, "T ∝ V²: 0,9² = 0,81."],
      ["Para que servem as chapas laminadas e isoladas do núcleo?", ["aumentar o peso", "reduzir correntes parasitas", "isolar o eixo", "aumentar o escorregamento"], 1, "Lâminas finas e isoladas cortam o caminho das correntes de Foucault."],
      ["Um motor de 7,5 kW com rendimento de 90% absorve da rede:", ["6,75 kW", "7,5 kW", "8,33 kW", "9,0 kW"], 2, "P_in = P_out/η = 7,5/0,9 ≈ 8,33 kW; cerca de 0,83 kW vira calor."],
      ["Na partida estrela-triângulo, a corrente de partida da linha cai para cerca de:", ["1/√3", "1/3", "1/2", "não muda"], 1, "Tensão por bobina dividida por √3 e mudança de ligação: corrente de linha e torque caem a 1/3."],
      ["Qual a temperatura máxima da classe de isolamento F?", ["105 °C", "130 °C", "155 °C", "180 °C"], 2, "A = 105, E = 120, B = 130, F = 155, H = 180 °C (IEC 60085)."]
    ],
    arduino: [
      ["LED com V_f = 2 V e 15 mA em 5 V. Resistor mínimo?", ["67 Ω", "133 Ω", "200 Ω", "333 Ω"], 2, "R = (5 − 2)/0,015 = 200 Ω."],
      ["O eco do HC-SR04 demorou 1160 µs. A distância é cerca de:", ["10 cm", "20 cm", "40 cm", "58 cm"], 1, "d ≈ 1160/58 = 20 cm."],
      ["Qual função roda apenas uma vez quando o Arduino liga?", ["loop()", "setup()", "main()", "start()"], 1, "setup() configura; loop() repete."],
      ["analogWrite(pino, 128) num pino PWM gera em média:", ["0 V", "≈ 2,5 V", "5 V", "128 V"], 1, "128/255 ≈ 50% de razão cíclica: média ≈ 2,5 V."]
    ]
  };

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function h(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === "text") e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem("ee-" + k) || "null"); localStorage.setItem("ee-" + k, JSON.stringify(v)); } catch (e) { return null; } }

  /* ================= FLASH CARDS (com caixas de Leitner) ================= */
  function montaDeck(box) {
    var chaves = (box.getAttribute("data-deck") || "").split(",");
    var seletor = chaves.length > 1;
    var atual = chaves[0], ordem = [], pos = 0;
    box.innerHTML = "";
    var bar = h("div", { "class": "ee-deck__bar" });
    var tit = h("p", { "class": "ee-deck__title" });
    var cont = h("span", { "class": "ee-deck__count", "aria-live": "polite" });
    bar.appendChild(tit);
    if (seletor) {
      var lab = h("label", { "class": "ee-field" });
      lab.style.margin = "0";
      var sel = h("select", { "aria-label": "Escolher o baralho de flash cards" });
      chaves.forEach(function (k) { var o = h("option", { value: k, text: DECKS[k].nome }); sel.appendChild(o); });
      sel.addEventListener("change", function () { atual = sel.value; inicia(); });
      lab.appendChild(sel); bar.appendChild(lab);
    }
    bar.appendChild(cont);
    var card = h("button", { type: "button", "class": "ee-card", "aria-describedby": "" });
    var inn = h("span", { "class": "ee-card__in" });
    var fr = h("span", { "class": "ee-card__f" });
    var bk = h("span", { "class": "ee-card__b", "aria-hidden": "true" });
    var tagF = h("span", { "class": "ee-card__tag" }), q = h("span", { "class": "ee-card__q" }), hint = h("span", { "class": "ee-card__hint", text: "Toque ou tecle Enter para ver a resposta" });
    var tagB = h("span", { "class": "ee-card__tag", text: "Resposta" }), a = h("span", { "class": "ee-card__a" });
    fr.appendChild(tagF); fr.appendChild(q); fr.appendChild(hint);
    bk.appendChild(tagB); bk.appendChild(a);
    inn.appendChild(fr); inn.appendChild(bk); card.appendChild(inn);
    var live = h("p", { "class": "a11y-sr", "aria-live": "polite" });
    var nav = h("div", { "class": "ee-deck__nav" });
    var bPrev = h("button", { type: "button", "class": "ee-btn", text: "← Anterior" });
    var bBad = h("button", { type: "button", "class": "ee-btn ee-bad", text: "Errei: rever logo" });
    var bOk = h("button", { type: "button", "class": "ee-btn ee-ok", text: "Acertei" });
    var bNext = h("button", { type: "button", "class": "ee-btn", text: "Próximo →" });
    var bMix = h("button", { type: "button", "class": "ee-btn", text: "Embaralhar" });
    [bPrev, bBad, bOk, bNext, bMix].forEach(function (b) { nav.appendChild(b); });
    box.appendChild(bar); box.appendChild(card); box.appendChild(live); box.appendChild(nav);

    function caixas() { return store("leitner-" + atual) || {}; }
    function inicia(mix) {
      var d = DECKS[atual]; tit.textContent = d.nome;
      var cx = caixas();
      ordem = d.cards.map(function (_, i) { return i; });
      // cards nas caixas mais baixas (mais erros) vêm primeiro
      ordem.sort(function (x, y) { return (cx[x] || 0) - (cx[y] || 0); });
      if (mix) for (var i = ordem.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = ordem[i]; ordem[i] = ordem[j]; ordem[j] = t; }
      pos = 0; mostra();
    }
    function mostra() {
      var d = DECKS[atual], c = d.cards[ordem[pos]];
      card.classList.remove("is-flip"); bk.setAttribute("aria-hidden", "true"); fr.removeAttribute("aria-hidden");
      tagF.textContent = d.nome; q.textContent = c[0]; a.textContent = c[1];
      card.setAttribute("aria-label", "Flash card " + (pos + 1) + " de " + ordem.length + ": " + c[0] + ". Ative para ver a resposta.");
      var cx = caixas(), dom = 0; d.cards.forEach(function (_, i) { if ((cx[i] || 0) >= 2) dom++; });
      cont.textContent = "Card " + (pos + 1) + " de " + ordem.length + " · dominados: " + dom;
    }
    function vira() {
      var on = card.classList.toggle("is-flip");
      var c = DECKS[atual].cards[ordem[pos]];
      bk.setAttribute("aria-hidden", on ? "false" : "true");
      if (on) { fr.setAttribute("aria-hidden", "true"); live.textContent = "Resposta: " + c[1]; card.setAttribute("aria-label", "Resposta: " + c[1] + ". Ative para voltar à pergunta."); }
      else { fr.removeAttribute("aria-hidden"); live.textContent = ""; card.setAttribute("aria-label", "Pergunta: " + c[0]); }
    }
    function marca(ok) {
      var cx = caixas(), i = ordem[pos];
      cx[i] = ok ? Math.min((cx[i] || 0) + 1, 4) : 0;
      store("leitner-" + atual, cx);
      if (!ok) { var x = ordem.splice(pos, 1)[0]; ordem.splice(Math.min(pos + 2, ordem.length), 0, x); }
      else pos = (pos + 1) % ordem.length;
      mostra();
    }
    card.addEventListener("click", vira);
    bPrev.addEventListener("click", function () { pos = (pos - 1 + ordem.length) % ordem.length; mostra(); });
    bNext.addEventListener("click", function () { pos = (pos + 1) % ordem.length; mostra(); });
    bOk.addEventListener("click", function () { marca(true); });
    bBad.addEventListener("click", function () { marca(false); });
    bMix.addEventListener("click", function () { inicia(true); });
    inicia();
  }

  /* ================= QUIZ ================= */
  function montaQuiz(box) {
    var chaves = (box.getAttribute("data-quiz") || "").split(",");
    var max = parseInt(box.getAttribute("data-max") || "0", 10);
    var titulo = box.getAttribute("data-titulo") || "Teste-se";
    var lista = [];
    chaves.forEach(function (k) { (QUIZ[k] || []).forEach(function (q) { lista.push(q); }); });
    var idx, acertos, respondida, perguntas;
    var uid = "q" + Math.random().toString(36).slice(2, 8);
    box.innerHTML = "";
    var hd = h("h3", { text: titulo });
    var meta = h("p", { "class": "ee-quiz__meta" });
    var area = h("div");
    var fb = h("p", { "class": "ee-quiz__fb", "aria-live": "polite" });
    var nav = h("div", { "class": "ee-quiz__nav" });
    var bOk = h("button", { type: "button", "class": "ee-btn", text: "Conferir" });
    var bNx = h("button", { type: "button", "class": "ee-btn", text: "Próxima" });
    var bRe = h("button", { type: "button", "class": "ee-btn", text: "Recomeçar" });
    nav.appendChild(bOk); nav.appendChild(bNx); nav.appendChild(bRe);
    box.appendChild(hd); box.appendChild(meta); box.appendChild(area); box.appendChild(fb); box.appendChild(nav);

    function inicia() {
      perguntas = lista.slice();
      for (var i = perguntas.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = perguntas[i]; perguntas[i] = perguntas[j]; perguntas[j] = t; }
      if (max && perguntas.length > max) perguntas = perguntas.slice(0, max);
      idx = 0; acertos = 0; mostra();
    }
    function mostra() {
      respondida = false; fb.innerHTML = ""; bOk.disabled = false; bNx.hidden = true; bOk.hidden = false;
      var q = perguntas[idx];
      meta.textContent = "Pergunta " + (idx + 1) + " de " + perguntas.length + " · acertos: " + acertos;
      area.innerHTML = "";
      var fs = h("fieldset"); var lg = h("legend", { text: q[0] }); fs.appendChild(lg);
      q[1].forEach(function (op, i) {
        var lab = h("label", { "class": "ee-opt" });
        var r = h("input", { type: "radio", name: uid + "-" + idx, value: String(i) });
        lab.appendChild(r); lab.appendChild(h("span", { text: op })); fs.appendChild(lab);
      });
      area.appendChild(fs);
    }
    function confere() {
      if (respondida) return;
      var marc = $("input:checked", area);
      if (!marc) { fb.textContent = "Escolha uma alternativa antes de conferir."; return; }
      respondida = true;
      var q = perguntas[idx], v = parseInt(marc.value, 10), ok = v === q[2];
      if (ok) acertos++;
      $$(".ee-opt", area).forEach(function (l, i) {
        if (i === q[2]) l.classList.add("is-right");
        else if (i === v) l.classList.add("is-wrong");
        $("input", l).disabled = true;
      });
      fb.innerHTML = (ok ? '<b class="ok">Certo!</b> ' : '<b class="no">Ainda não.</b> A resposta é “' + q[1][q[2]].replace(/</g, "&lt;") + '”. ') + q[3].replace(/</g, "&lt;");
      bOk.hidden = true;
      if (idx < perguntas.length - 1) { bNx.hidden = false; bNx.focus(); }
      else {
        var pct = Math.round(100 * acertos / perguntas.length);
        meta.textContent = "Resultado: " + acertos + " de " + perguntas.length + " (" + pct + "%)";
        fb.innerHTML += '<br><span class="ee-quiz__score">Você acertou ' + acertos + " de " + perguntas.length + ". " + (pct >= 80 ? "Excelente! Revise de novo daqui a alguns dias para fixar." : "Releia a teoria e refaça amanhã: errar e corrigir é o que fixa o conteúdo.") + "</span>";
        bRe.focus();
      }
    }
    bOk.addEventListener("click", confere);
    bNx.addEventListener("click", function () { idx++; mostra(); var f = $("input", area); if (f) f.focus(); });
    bRe.addEventListener("click", inicia);
    inicia();
  }

  /* ================= LAB: divisor de tensão ================= */
  function labDivisor() {
    var v = $("#dv-v"), r1 = $("#dv-r1"), r2 = $("#dv-r2");
    if (!v) return;
    function nf(x, d) { return x.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }); }
    function up() {
      var V = +v.value, R1 = +r1.value, R2 = +r2.value;
      var I = V / (R1 + R2), V2 = V * R2 / (R1 + R2), P = V * I;
      $("#dv-v-o").textContent = nf(V, 1) + " V";
      $("#dv-r1-o").textContent = nf(R1 / 1000, 1) + " kΩ";
      $("#dv-r2-o").textContent = nf(R2 / 1000, 1) + " kΩ";
      $("#dv-i").textContent = nf(I * 1000, 2) + " mA";
      $("#dv-v1").textContent = nf(V - V2, 2) + " V";
      $("#dv-v2").textContent = nf(V2, 2) + " V";
      $("#dv-p").textContent = nf(P * 1000, 1) + " mW";
    }
    [v, r1, r2].forEach(function (e) { e.addEventListener("input", up); });
    up();
  }

  /* ================= LAB: campo girante ================= */
  function labCampo() {
    var svg = $("#mf-svg"); if (!svg) return;
    var NS = "http://www.w3.org/2000/svg", cx = 150, cy = 150;
    var cores = ["#ff6b5e", "#5bd17d", "#5aa8ff"];
    var vec = [], i;
    for (i = 0; i < 3; i++) {
      var l = document.createElementNS(NS, "line");
      l.setAttribute("class", "mf-vec"); l.setAttribute("stroke", cores[i]); l.setAttribute("x1", cx); l.setAttribute("y1", cy);
      svg.appendChild(l); vec.push(l);
    }
    var res = document.createElementNS(NS, "line"); res.setAttribute("class", "mf-res"); res.setAttribute("x1", cx); res.setAttribute("y1", cy); svg.appendChild(res);
    var rotor = $("#mf-rotorg", svg);
    var btn = $("#mf-play"), sl = $("#mf-s"), so = $("#mf-s-o"), st = $("#mf-status");
    var rodando = !matchMedia("(prefers-reduced-motion: reduce)").matches, th = 0, ang = 0, last = 0;
    function pausado() { return document.documentElement.classList.contains("a11y-pausar"); }
    function desenha() {
      var R = 95, sx = 0, sy = 0;
      for (var k = 0; k < 3; k++) {
        var eixo = k * 2 * Math.PI / 3;              // posição espacial da bobina
        var mag = Math.cos(th - eixo);              // corrente defasada 120° no tempo
        var x = R * mag * Math.cos(eixo), y = R * mag * Math.sin(eixo);
        vec[k].setAttribute("x2", cx + x * 0.66); vec[k].setAttribute("y2", cy - y * 0.66);
        sx += x; sy += y;
      }
      res.setAttribute("x2", cx + sx * 0.66 / 1.5 * 1.0); res.setAttribute("y2", cy - sy * 0.66 / 1.5 * 1.0);
      if (rotor) rotor.setAttribute("transform", "rotate(" + (-ang * 180 / Math.PI) + " " + cx + " " + cy + ")");
    }
    function quadro(t) {
      if (!last) last = t; var dt = Math.min((t - last) / 1000, 0.05); last = t;
      if (rodando && !pausado()) {
        var w = 1.4; // rad/s do campo (câmera lenta)
        var s = +sl.value / 100;
        th += w * dt; ang += w * (1 - s) * dt;
      }
      desenha(); requestAnimationFrame(quadro);
    }
    function rot() {
      var s = +sl.value; so.textContent = s + "%";
      st.textContent = s === 0 ? "Rotor girando junto com o campo: sem variação de fluxo, sem corrente induzida e sem torque." : "O rotor fica " + s + "% mais lento que o campo; essa diferença induz correntes nas barras e gera torque.";
    }
    btn.addEventListener("click", function () { rodando = !rodando; btn.setAttribute("aria-pressed", String(!rodando)); btn.textContent = rodando ? "Pausar" : "Continuar"; });
    btn.textContent = rodando ? "Pausar" : "Continuar"; btn.setAttribute("aria-pressed", String(!rodando));
    sl.addEventListener("input", rot); rot();
    desenha(); requestAnimationFrame(quadro);
  }

  /* ================= LAB: calculadora do motor + curva torque × velocidade ================= */
  function labMotor() {
    var f = $("#mt-f"); if (!f) return;
    var p = $("#mt-p"), n = $("#mt-n"), sm = $("#mt-sm");
    var svg = $("#mt-svg"), NS = "http://www.w3.org/2000/svg";
    function nf(x, d) { return x.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }); }
    var X0 = 50, Y0 = 210, W = 360, H = 180;
    function up() {
      var F = +f.value, P = +p.value, ns = 120 * F / P;
      n.max = String(Math.round(ns));
      if (+n.value > ns) n.value = String(Math.round(ns * 0.97));
      var N = +n.value, s = (ns - N) / ns, smax = +sm.value / 100;
      $("#mt-n-o").textContent = nf(N, 0) + " rpm";
      $("#mt-sm-o").textContent = nf(smax * 100, 0) + "%";
      $("#mt-ns").textContent = nf(ns, 0) + " rpm";
      $("#mt-s").textContent = nf(s * 100, 2) + "%";
      $("#mt-fr").textContent = nf(s * F, 2) + " Hz";
      // Fórmula de Kloss: T/Tmax = 2 / (s/smax + smax/s)
      var tr = s <= 0 ? 0 : 2 / (s / smax + smax / s);
      $("#mt-t").textContent = nf(tr * 100, 0) + "% de T_máx";
      var tp = 2 / (1 / smax + smax);
      $("#mt-tp").textContent = nf(tp * 100, 0) + "% de T_máx";
      // curva
      var d = "", k;
      for (k = 0; k <= 200; k++) {
        var nn = k / 200, ss = 1 - nn, t = ss <= 0 ? 0 : 2 / (ss / smax + smax / ss);
        d += (k ? " L" : "M") + (X0 + nn * W).toFixed(1) + " " + (Y0 - t * H).toFixed(1);
      }
      $("#mt-curve").setAttribute("d", d);
      var xn = X0 + (N / ns) * W, yn = Y0 - tr * H;
      var dot = $("#mt-dot"); dot.setAttribute("cx", xn.toFixed(1)); dot.setAttribute("cy", yn.toFixed(1));
      var ln = $("#mt-vline"); ln.setAttribute("x1", xn.toFixed(1)); ln.setAttribute("x2", xn.toFixed(1));
      $("#mt-lbl-ns").textContent = nf(ns, 0);
      svg.setAttribute("aria-label", "Curva torque por velocidade. Velocidade síncrona " + nf(ns, 0) + " rpm; ponto de operação em " + nf(N, 0) + " rpm, escorregamento " + nf(s * 100, 1) + "%, torque " + nf(tr * 100, 0) + "% do máximo.");
    }
    [f, p, n, sm].forEach(function (e) { e.addEventListener("input", up); e.addEventListener("change", up); });
    up();
  }

  /* ================= LAB: aquecimento (modelo térmico de 1ª ordem) ================= */
  function labTermico() {
    var c = $("#th-c"); if (!c) return;
    var amb = $("#th-amb"), cls = $("#th-cls"), tau = $("#th-tau");
    function nf(x, d) { return x.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }); }
    var X0 = 50, Y0 = 210, W = 360, H = 180, TMAX = 200;
    function up() {
      var carga = +c.value / 100, ta = +amb.value, lim = +cls.value, tt = +tau.value;
      // elevação nominal ~80 K (classe B de elevação) proporcional às perdas; perdas Joule ∝ carga²; perdas fixas ~30%
      var dTn = 80, dT = dTn * (0.3 + 0.7 * carga * carga);
      var tf = ta + dT;
      $("#th-c-o").textContent = nf(carga * 100, 0) + "%";
      $("#th-amb-o").textContent = nf(ta, 0) + " °C";
      $("#th-tau-o").textContent = nf(tt, 0) + " min";
      $("#th-tf").textContent = nf(tf, 0) + " °C";
      $("#th-marg").textContent = nf(lim - tf, 0) + " °C";
      var vida = Math.pow(2, (lim - 10 - tf) / 10); // regra de 10 °C (aproximação didática, 10 °C de folga para o ponto quente)
      $("#th-vida").textContent = vida >= 1 ? "≥ nominal" : nf(vida * 100, 0) + "% da nominal";
      var d = "", k;
      for (k = 0; k <= 120; k++) {
        var t = k / 120 * 5 * tt, T = ta + dT * (1 - Math.exp(-t / tt));
        d += (k ? " L" : "M") + (X0 + k / 120 * W).toFixed(1) + " " + (Y0 - T / TMAX * H).toFixed(1);
      }
      $("#th-curve").setAttribute("d", d);
      var yl = (Y0 - lim / TMAX * H).toFixed(1);
      var lm = $("#th-lim"); lm.setAttribute("y1", yl); lm.setAttribute("y2", yl);
      $("#th-lim-t").setAttribute("y", (+yl - 5).toFixed(1)); $("#th-lim-t").textContent = "limite " + lim + " °C";
      $("#th-x").textContent = nf(5 * tt, 0) + " min";
      $("#th-st").textContent = tf > lim - 10 ? "Atenção: o enrolamento passa perto ou acima do limite da classe. O isolamento envelhece mais rápido." : "Temperatura final dentro do limite da classe, com folga.";
      $("#th-svg").setAttribute("aria-label", "Curva de aquecimento do motor: começa em " + nf(ta, 0) + " °C e tende a " + nf(tf, 0) + " °C com constante de tempo de " + nf(tt, 0) + " minutos. Limite da classe: " + lim + " °C.");
    }
    [c, amb, cls, tau].forEach(function (e) { e.addEventListener("input", up); e.addEventListener("change", up); });
    up();
  }

  function init() {
    $$("[data-deck]").forEach(montaDeck);
    $$("[data-quiz]").forEach(montaQuiz);
    labDivisor(); labCampo(); labMotor(); labTermico();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
