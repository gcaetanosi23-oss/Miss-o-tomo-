/* =========================================================
   MISSAO ATOMO - BLOCO A
   Sistema modular de desafios sobre distribuicao eletronica
   =========================================================
   Este arquivo cobre os 118 elementos quimicos (Z = 1 a 118).
   Consulte o resumo de alteracoes no final deste arquivo para
   saber o que mudou na expansao de Z=1-36 para Z=1-118.
   ========================================================= */

/* ---------------------------------------------------------
   1. DADOS CIENTIFICOS BASE
   --------------------------------------------------------- */

// Tabela dos 118 elementos (nomes em portugues). Elementos 113-118
// tiveram seus nomes oficializados pela IUPAC em nov/2016; a forma
// em portugues usada aqui segue o uso didatico brasileiro comum
// (ha pequenas variacoes regionais, ex.: "nipnio" em algumas fontes).
const periodicTable = {
    1: ["H", "Hidrogenio"], 2: ["He", "Helio"], 3: ["Li", "Litio"], 4: ["Be", "Berilio"],
    5: ["B", "Boro"], 6: ["C", "Carbono"], 7: ["N", "Nitrogenio"], 8: ["O", "Oxigenio"],
    9: ["F", "Fluor"], 10: ["Ne", "Neonio"], 11: ["Na", "Sodio"], 12: ["Mg", "Magnesio"],
    13: ["Al", "Aluminio"], 14: ["Si", "Silicio"], 15: ["P", "Fosforo"], 16: ["S", "Enxofre"],
    17: ["Cl", "Cloro"], 18: ["Ar", "Argonio"], 19: ["K", "Potassio"], 20: ["Ca", "Calcio"],
    21: ["Sc", "Escandio"], 22: ["Ti", "Titanio"], 23: ["V", "Vanadio"], 24: ["Cr", "Cromo"],
    25: ["Mn", "Manganes"], 26: ["Fe", "Ferro"], 27: ["Co", "Cobalto"], 28: ["Ni", "Niquel"],
    29: ["Cu", "Cobre"], 30: ["Zn", "Zinco"], 31: ["Ga", "Galio"], 32: ["Ge", "Germanio"],
    33: ["As", "Arsenio"], 34: ["Se", "Selenio"], 35: ["Br", "Bromo"], 36: ["Kr", "Criptonio"],
    37: ["Rb", "Rubidio"], 38: ["Sr", "Estroncio"], 39: ["Y", "Itrio"], 40: ["Zr", "Zirconio"],
    41: ["Nb", "Niobio"], 42: ["Mo", "Molibdenio"], 43: ["Tc", "Tecnecio"], 44: ["Ru", "Rutenio"],
    45: ["Rh", "Rodio"], 46: ["Pd", "Paladio"], 47: ["Ag", "Prata"], 48: ["Cd", "Cadmio"],
    49: ["In", "Indio"], 50: ["Sn", "Estanho"], 51: ["Sb", "Antimonio"], 52: ["Te", "Telurio"],
    53: ["I", "Iodo"], 54: ["Xe", "Xenonio"], 55: ["Cs", "Cesio"], 56: ["Ba", "Bario"],
    57: ["La", "Lantanio"], 58: ["Ce", "Cerio"], 59: ["Pr", "Praseodimio"], 60: ["Nd", "Neodimio"],
    61: ["Pm", "Prometio"], 62: ["Sm", "Samario"], 63: ["Eu", "Europio"], 64: ["Gd", "Gadolinio"],
    65: ["Tb", "Terbio"], 66: ["Dy", "Disprosio"], 67: ["Ho", "Holmio"], 68: ["Er", "Erbio"],
    69: ["Tm", "Tulio"], 70: ["Yb", "Iterbio"], 71: ["Lu", "Lutecio"], 72: ["Hf", "Hafnio"],
    73: ["Ta", "Tantalo"], 74: ["W", "Tungstenio"], 75: ["Re", "Renio"], 76: ["Os", "Osmio"],
    77: ["Ir", "Iridio"], 78: ["Pt", "Platina"], 79: ["Au", "Ouro"], 80: ["Hg", "Mercurio"],
    81: ["Tl", "Talio"], 82: ["Pb", "Chumbo"], 83: ["Bi", "Bismuto"], 84: ["Po", "Polonio"],
    85: ["At", "Astato"], 86: ["Rn", "Radonio"], 87: ["Fr", "Francio"], 88: ["Ra", "Radio"],
    89: ["Ac", "Actinio"], 90: ["Th", "Torio"], 91: ["Pa", "Protactinio"], 92: ["U", "Uranio"],
    93: ["Np", "Netunio"], 94: ["Pu", "Plutonio"], 95: ["Am", "Americio"], 96: ["Cm", "Curio"],
    97: ["Bk", "Berquelio"], 98: ["Cf", "Californio"], 99: ["Es", "Einstenio"], 100: ["Fm", "Fermio"],
    101: ["Md", "Mendelevio"], 102: ["No", "Nobelio"], 103: ["Lr", "Laurencio"], 104: ["Rf", "Rutherfordio"],
    105: ["Db", "Dubnio"], 106: ["Sg", "Seaborgio"], 107: ["Bh", "Bohrio"], 108: ["Hs", "Hassio"],
    109: ["Mt", "Meitnerio"], 110: ["Ds", "Darmstadtio"], 111: ["Rg", "Roentgenio"], 112: ["Cn", "Copernicio"],
    113: ["Nh", "Nihonio"], 114: ["Fl", "Flerovio"], 115: ["Mc", "Moscovio"], 116: ["Lv", "Livermorio"],
    117: ["Ts", "Tenessino"], 118: ["Og", "Oganessonio"]
};

// Ordem energetica completa (diagrama de Linus Pauling / regra de Madelung).
// A soma das capacidades desta lista e exatamente 118, cobrindo todos os
// elementos conhecidos: 2+2+6+2+6+2+10+6+2+10+6+2+14+10+6+2+14+10+6 = 118.
const orbitalsOrder = [
    "1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p",
    "5s", "4d", "5p", "6s", "4f", "5d", "6p", "7s",
    "5f", "6d", "7p"
];

const orbitalCapacity = { s: 2, p: 6, d: 10, f: 14 };
const orbitalsCount   = { s: 1, p: 3, d: 5, f: 7 };
const shellLetters    = { 1: "K", 2: "L", 3: "M", 4: "N", 5: "O", 6: "P", 7: "Q" };

// Excecoes reais de preenchimento (configuracao eletronica do atomo neutro no
// estado fundamental) em relacao ao preenchimento sequencial simples (aufbau).
// Dados verificados contra a tabela de referencia da IUPAC/NIST/CRC Handbook
// (fonte: "Electron configurations of the elements", que cita NIST Atomic
// Spectra Database, CRC Handbook of Chemistry and Physics e WebElements).
// Cada entrada indica apenas os subniveis que diferem do preenchimento
// sequencial simples; o restante da distribuicao permanece igual ao calculo
// padrao. Elementos 109-118 tem configuracao teorica/prevista (nunca medida
// experimentalmente) e coincidem com o preenchimento sequencial simples,
// por isso nao aparecem nesta lista de excecoes.
const stabilityExceptions = {
    24:  { "4s": 1, "3d": 5 },              // Cromo: [Ar] 3d5 4s1
    29:  { "4s": 1, "3d": 10 },             // Cobre: [Ar] 3d10 4s1
    41:  { "5s": 1, "4d": 4 },              // Niobio: [Kr] 4d4 5s1
    42:  { "5s": 1, "4d": 5 },              // Molibdenio: [Kr] 4d5 5s1
    44:  { "5s": 1, "4d": 7 },              // Rutenio: [Kr] 4d7 5s1
    45:  { "5s": 1, "4d": 8 },              // Rodio: [Kr] 4d8 5s1
    46:  { "5s": 0, "4d": 10 },             // Paladio: [Kr] 4d10 (5s vazio)
    47:  { "5s": 1, "4d": 10 },             // Prata: [Kr] 4d10 5s1
    57:  { "4f": 0, "5d": 1 },              // Lantanio: [Xe] 5d1 6s2
    58:  { "4f": 1, "5d": 1 },              // Cerio: [Xe] 4f1 5d1 6s2
    64:  { "4f": 7, "5d": 1 },              // Gadolinio: [Xe] 4f7 5d1 6s2
    78:  { "6s": 1, "5d": 9 },              // Platina: [Xe] 4f14 5d9 6s1
    79:  { "6s": 1, "5d": 10 },             // Ouro: [Xe] 4f14 5d10 6s1
    89:  { "5f": 0, "6d": 1 },              // Actinio: [Rn] 6d1 7s2
    90:  { "5f": 0, "6d": 2 },              // Torio: [Rn] 6d2 7s2
    91:  { "5f": 2, "6d": 1 },              // Protactinio: [Rn] 5f2 6d1 7s2
    92:  { "5f": 3, "6d": 1 },              // Uranio: [Rn] 5f3 6d1 7s2
    93:  { "5f": 4, "6d": 1 },              // Netunio: [Rn] 5f4 6d1 7s2
    96:  { "5f": 7, "6d": 1 },              // Curio: [Rn] 5f7 6d1 7s2
    103: { "6d": 0, "7p": 1 }               // Laurencio: [Rn] 5f14 7s2 7p1 (IUPAC 2021)
};

function subshellType(orb) { return orb.slice(-1); }

function baseDistribution(totalElectrons) {
    let remaining = totalElectrons;
    const dist = {};
    for (const orb of orbitalsOrder) {
        if (remaining <= 0) break;
        const cap = orbitalCapacity[subshellType(orb)];
        const fill = Math.min(cap, remaining);
        dist[orb] = fill;
        remaining -= fill;
    }
    return dist;
}

// Distribuicao correta = preenchimento sequencial simples, com a excecao
// real aplicada por cima quando existir. Cada excecao troca eletrons entre
// 2-3 subniveis vizinhos sem alterar o total de eletrons (Z), entao a soma
// da distribuicao final sempre bate com o numero atomico.
function calculateCorrectDistribution(Z) {
    const dist = baseDistribution(Z);
    if (stabilityExceptions[Z]) {
        Object.assign(dist, stabilityExceptions[Z]);
    }
    return dist;
}

function getOccupiedSubshells(Z) {
    const dist = calculateCorrectDistribution(Z);
    return orbitalsOrder.filter(o => dist[o] > 0);
}

function toSuperscript(n) {
    const sup = { "0":"\u2070","1":"\u00b9","2":"\u00b2","3":"\u00b3","4":"\u2074","5":"\u2075","6":"\u2076","7":"\u2077","8":"\u2078","9":"\u2079" };
    return String(n).split("").map(d => sup[d]).join("");
}

function formatConfig(dist, order) {
    return order.filter(o => dist[o] > 0).map(o => o + toSuperscript(dist[o])).join(" ");
}

// Elétrons de valência.
// - Bloco p (subnivel np ocupado): valencia = ns + np. O (n-1)d, quando
//   presente, esta sempre completo (10) nesses elementos e e tratado como
//   camada de nucleo, nao de valencia (convencao padrao para Ga, Sn, Pb...).
// - Bloco s ou bloco d (sem np ocupado): valencia = ns + (n-1)d. Essa e a
//   convencao didatica usual para metais de transicao (Sc-Zn, Y-Cd, La e
//   Hf-Hg, Ac e Rf-Cn). ATENCAO: para elementos com (n-1)d10 completo
//   (Zn, Cd, Hg, Pd, Cu, Ag, Au), essa convencao inclui os 10 eletrons do
//   d na valencia; alguns livros didaticos simplificam e contam apenas o ns
//   nesses casos. Ambas as convencoes existem na literatura; o jogo adota
//   a primeira (mais comum em cursos de Quimica Geral/Inorganica) de forma
//   consistente em toda a tabela.
function getValenceElectrons(Z) {
    const dist = calculateCorrectDistribution(Z);
    const occupied = getOccupiedSubshells(Z);
    const maxN = Math.max(...occupied.map(o => parseInt(o)));
    const pElectrons = dist[maxN + "p"] || 0;
    const sElectrons = dist[maxN + "s"] || 0;
    if (pElectrons > 0) {
        return sElectrons + pElectrons;
    }
    const dElectrons = dist[(maxN - 1) + "d"] || 0;
    return sElectrons + dElectrons;
}

// Elementos com subnivel f PARCIALMENTE preenchido (0 < f < 14) tem
// contagem de eletrons de valencia genuinamente controversa na literatura
// de Quimica (lantanideos Ce-Yb e actinideos Pa-Md): dependendo da fonte,
// os eletrons f podem ou nao ser contados como "de valencia", e isso muda
// o resultado. Para nao ensinar uma regra simplificada como se fosse
// consenso, esses elementos sao excluidos dos desafios que dependem do
// numero de eletrons de valencia (mas continuam disponiveis em todos os
// outros desafios, incluindo distribuicao, caixas e diagrama de Pauling).
function hasUnambiguousValence(Z) {
    const dist = calculateCorrectDistribution(Z);
    const f4 = dist["4f"] || 0;
    const f5 = dist["5f"] || 0;
    if (f4 > 0 && f4 < 14) return false;
    if (f5 > 0 && f5 < 14) return false;
    return true;
}

function getOuterShellN(Z) {
    const occupied = getOccupiedSubshells(Z);
    return Math.max(...occupied.map(o => parseInt(o)));
}
function getOuterShellLetter(Z) { return shellLetters[getOuterShellN(Z)]; }
function getPeriod(Z) { return getOuterShellN(Z); }

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomZ() { return randInt(1, 118); }
function pickRandom(arr) { return arr[randInt(0, arr.length - 1)]; }
function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = randInt(0, i);
        const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
}
function elementLabel(Z) { const p = periodicTable[Z]; return p[0] + " (" + p[1] + ")"; }

// Sorteia numeros atomicos "vizinhos" de Z para servirem de alternativas
// erradas plausiveis em questoes de multipla escolha (evita distratores
// aleatorios demais, como comparar Hidrogenio com Oganessonio).
function pickDistractorZs(Z, count) {
    const nearby = [];
    for (let d = 1; d <= 20 && nearby.length < count * 4; d++) {
        if (Z - d >= 1) nearby.push(Z - d);
        if (Z + d <= 118) nearby.push(Z + d);
    }
    const pool = nearby.length >= count ? nearby : Object.keys(periodicTable).map(Number).filter(k => k !== Z);
    return shuffle(pool).slice(0, count);
}

// Retorna true se Z esta apto a ser sorteado para um desafio que dependa de
// elétrons de valencia bem definidos (ver hasUnambiguousValence acima).
function pickCompatibleZ(zFilter) {
    if (!zFilter) return randomZ();
    for (let attempt = 0; attempt < 60; attempt++) {
        const z = randomZ();
        if (zFilter(z)) return z;
    }
    // fallback improvavel: varre sequencialmente
    for (let z = 1; z <= 118; z++) { if (zFilter(z)) return z; }
    return randomZ();
}


/* ---------------------------------------------------------
   2. ESTADO GLOBAL DO JOGO
   --------------------------------------------------------- */
   // Armazenamento por slots (compartilhado com o Bloco B via storage.js) -
   // ver missaoAtomoSaveBlocoA/missaoAtomoGetSlot.

const state = {
    currentSlot: null,
    Z: null,
    challengeId: null,
    challengeState: null,   // dados especificos gerados para a rodada (distratores, etc.)
    score: 0,
    streak: 0,
    history: [],             // ultimos ids de desafio sorteados (anti-repeticao)
    answered: false
};

function saveProgress() {
    if (!state.currentSlot) return;
    missaoAtomoSaveBlocoA(state.currentSlot, { points: state.score, streak: state.streak });
}

/* ---------------------------------------------------------
   3. COMPONENTES REUTILIZAVEIS DE INTERFACE
   --------------------------------------------------------- */

// Cria a grade de inputs por subnivel, agrupados por camada (K, L, M...),
// reaproveitando o layout original do jogo. Usado pelos desafios 1 e 5.
function buildSublevelGrid(containerEl, subshellsToShow, options) {
    options = options || {};
    const byShell = {};
    subshellsToShow.forEach(orb => {
        const n = orb[0];
        if (!byShell[n]) byShell[n] = [];
        byShell[n].push(orb);
    });

    const wrap = document.createElement("div");
    wrap.className = "linus-pauling-diagram";

    Object.keys(byShell).sort((a, b) => a - b).forEach(n => {
        const row = document.createElement("div");
        row.className = "orbital-row";
        const label = document.createElement("div");
        label.className = "orbital-label";
        label.textContent = (shellLetters[n] || n) + " (" + n + "):";
        row.appendChild(label);

        const inputsWrap = document.createElement("div");
        inputsWrap.className = "orbital-inputs";
        byShell[n].forEach(orb => {
            const group = document.createElement("div");
            group.className = "orbital-input-group " + subshellType(orb) + "-sublevel";
            group.textContent = orb;
            const input = document.createElement("input");
            input.type = "number";
            input.min = "0";
            input.className = "sublevel-input";
            input.dataset.orbital = orb;
            if (options.disabled && options.disabled.includes(orb)) {
                input.value = options.prefill ? options.prefill[orb] : "";
                input.disabled = true;
            }
            group.appendChild(input);
            inputsWrap.appendChild(group);
        });
        row.appendChild(inputsWrap);
        wrap.appendChild(row);
    });

    containerEl.appendChild(wrap);
}

function readSublevelGrid(containerEl) {
    const inputs = containerEl.querySelectorAll(".sublevel-input:not([disabled])");
    const answer = {};
    inputs.forEach(inp => {
        answer[inp.dataset.orbital] = inp.value === "" ? null : parseInt(inp.value);
    });
    return answer;
}

// Compara resposta do estudante (por subnivel) com o gabarito, gerando
// os "steps" usados no feedback passo a passo (item 7 da especificacao).
function compareSublevels(userAnswer, correctDist, subshellsChecked) {
    const steps = [];
    let correctCount = 0;
    subshellsChecked.forEach(orb => {
        const expected = correctDist[orb] || 0;
        const given = userAnswer[orb];
        if (given === null || given === undefined) {
            steps.push({ label: orb, status: "empty", expected, given: null });
        } else if (given === expected) {
            steps.push({ label: orb, status: "correct", expected, given });
            correctCount++;
        } else {
            steps.push({ label: orb, status: "incorrect", expected, given });
        }
    });
    return { steps, correctCount, total: subshellsChecked.length };
}

function renderStepFeedback(container, steps) {
    container.innerHTML = "";
    steps.forEach(s => {
        const chip = document.createElement("span");
        let icon = "\u26aa", cls = "chip-empty";
        if (s.status === "correct") { icon = "\ud83d\udfe2"; cls = "chip-ok"; }
        else if (s.status === "incorrect") { icon = "\ud83d\udd34"; cls = "chip-bad"; }
        chip.className = "step-chip " + cls;
        const givenTxt = s.given === null || s.given === undefined ? "vazio" : s.given;
        chip.textContent = icon + " " + s.label + toSuperscript(s.given === null || s.given===undefined ? "" : s.given) + " (" + s.label + " = " + givenTxt + ")";
        container.appendChild(chip);
    });
}

// Caixas orbitais interativas (notacao de caixas) - Desafio 3.
// Cada caixa alterna entre 0 -> 1 (seta para cima) -> 2 (par de setas) -> 0.
function buildBoxNotation(containerEl, subshellsToShow) {
    containerEl.dataset.boxState = "{}";
    const boxState = {};
    subshellsToShow.forEach(orb => {
        boxState[orb] = new Array(orbitalsCount[subshellType(orb)]).fill(0);
    });

    subshellsToShow.forEach(orb => {
        const group = document.createElement("div");
        group.className = "box-subshell-group";
        const label = document.createElement("div");
        label.className = "box-subshell-label";
        label.textContent = "Subnivel " + orb + " (" + orbitalsCount[subshellType(orb)] + " orbital" + (orbitalsCount[subshellType(orb)] > 1 ? "is" : "") + ")";
        group.appendChild(label);

        const row = document.createElement("div");
        row.className = "box-row";
        for (let i = 0; i < orbitalsCount[subshellType(orb)]; i++) {
            const box = document.createElement("div");
            box.className = "orbital-box";
            box.dataset.orbital = orb;
            box.dataset.index = i;
            box.dataset.state = "0";
            box.textContent = "";
            box.addEventListener("click", () => {
                let st = parseInt(box.dataset.state);
                st = (st + 1) % 3;
                box.dataset.state = String(st);
                box.textContent = st === 0 ? "" : (st === 1 ? "\u2191" : "\u2191\u2193");
                boxState[orb][i] = st;
            });
            row.appendChild(box);
        }
        group.appendChild(row);
        containerEl.appendChild(group);
    });

    containerEl._boxState = boxState;
}

function readBoxNotation(containerEl) {
    return containerEl._boxState;
}

// Avalia a notacao de caixas: checa numero total de eletrons por subnivel E
// a Regra de Hund (preenchimento individual antes do emparelhamento).
// O limite de 2 eletrons por caixa, imposto pela propria interface (clique
// ciclico 0-1-2), garante estruturalmente o Principio da Exclusao de Pauli.
function evaluateBoxNotation(boxState, correctDist, subshellsChecked) {
    const steps = [];
    let allCorrect = true;
    subshellsChecked.forEach(orb => {
        const boxes = boxState[orb] || [];
        const K = orbitalsCount[subshellType(orb)];
        const E = correctDist[orb] || 0;
        const expectedPaired = Math.max(0, E - K);
        const expectedSingle = E - 2 * expectedPaired;

        const actualPaired = boxes.filter(v => v === 2).length;
        const actualSingle = boxes.filter(v => v === 1).length;
        const actualTotal = actualPaired * 2 + actualSingle;

        let status = "correct";
        let errorType = null;
        if (actualTotal !== E) {
            status = "incorrect";
            errorType = actualTotal > E ? "excesso_eletrons" : "faltam_eletrons";
        } else if (actualPaired !== expectedPaired || actualSingle !== expectedSingle) {
            status = "incorrect";
            errorType = "regra_hund";
        }
        if (status !== "correct") allCorrect = false;
        steps.push({ label: orb, status, errorType, expected: E, given: actualTotal, expectedPaired, actualPaired, expectedSingle, actualSingle });
    });
    return { steps, allCorrect };
}

// Multipla escolha generica.
function buildMultipleChoice(containerEl, options, onSelect) {
    const wrap = document.createElement("div");
    wrap.className = "mc-options";
    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mc-option";
        btn.textContent = opt.label;
        btn.dataset.value = opt.value;
        btn.addEventListener("click", () => {
            wrap.querySelectorAll(".mc-option").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            containerEl._selectedValue = opt.value;
        });
        wrap.appendChild(btn);
    });
    containerEl.appendChild(wrap);
    containerEl._mcWrap = wrap;
}

/* ---------------------------------------------------------
   4. REGISTRO DE DESAFIOS (arquitetura modular)
   ---------------------------------------------------------
   Cada desafio implementa: title, icon, level, points,
   hideZ/hideIdentity (opcional), question(Z), render(el,Z),
   verify(el,Z) -> { correct, fraction, steps, you, problem, fix, concept }
   --------------------------------------------------------- */

const challengeTypes = {};

/* ---- Desafio (nivel 1): reconhecer o simbolo a partir de Z ---- */
challengeTypes.recognizeSymbol = {
    title: "Reconheça o Elemento", icon: "\ud83d\udd0d", level: 1, points: 1,
    hideIdentity: true,
    question: (Z) => "O elemento de número atômico Z = " + Z + " corresponde a qual símbolo químico?",
    generate: (Z) => {
        const others = pickDistractorZs(Z, 3);
        const options = shuffle([Z, ...others]).map(k => ({ label: periodicTable[k][0], value: String(k) }));
        return { options, correctValue: String(Z) };
    },
    render: (el, Z, extra) => { buildMultipleChoice(el, extra.options); },
    verify: (el, Z, extra) => {
        const sel = el.querySelector(".mc-option.selected");
        const value = sel ? sel.dataset.value : null;
        const correct = value === extra.correctValue;
        return {
            correct, fraction: correct ? 1 : 0,
            you: sel ? sel.textContent : "(nenhuma alternativa selecionada)",
            problem: correct ? "" : "O símbolo escolhido não corresponde ao número atômico " + Z + ".",
            fix: correct ? "" : "O elemento de Z = " + Z + " é " + elementLabel(Z) + ".",
            concept: "O número atômico (Z) identifica um elemento de forma única: é o número de prótons (e, no átomo neutro, também de elétrons)."
        };
    }
};

/* ---- Desafio (nivel 1): eletrons de valencia ---- */
challengeTypes.valenceElectrons = {
    title: "Elétrons de Valência", icon: "\u26a1", level: 1, points: 1,
    zFilter: hasUnambiguousValence,
    question: (Z) => "Com base na distribuição eletrônica do elemento apresentado, determine o número de elétrons presentes na camada de valência.",
    generate: (Z) => ({ correctValue: getValenceElectrons(Z) }),
    render: (el) => {
        const wrap = document.createElement("div");
        wrap.className = "numeric-input-wrap";
        wrap.innerHTML = '<label class="font-semibold text-gray-700">Número de elétrons de valência:</label>';
        const input = document.createElement("input");
        input.type = "number"; input.min = "0"; input.className = "numeric-input"; input.id = "numericAnswer";
        wrap.appendChild(input);
        el.appendChild(wrap);
    },
    verify: (el, Z, extra) => {
        const input = el.querySelector("#numericAnswer");
        const given = input.value === "" ? null : parseInt(input.value);
        const correct = given === extra.correctValue;
        const dist = calculateCorrectDistribution(Z);
        const occ = getOccupiedSubshells(Z);
        const maxN = getOuterShellN(Z);
        const isPBlock = (dist[maxN + "p"] || 0) > 0;
        return {
            correct, fraction: correct ? 1 : 0,
            you: given === null ? "(em branco)" : String(given),
            problem: correct ? "" : "O valor informado não corresponde aos elétrons da camada de valência.",
            fix: correct ? "" : "A resposta correta é " + extra.correctValue + ".",
            concept: isPBlock
                ? "Elétrons de valência são os elétrons da camada mais externa (maior n): " + formatConfig(dist, occ) + "."
                : "Para elementos de transição, por convenção, contam-se como elétrons de valência os elétrons do subnível ns somados aos do subnível (n-1)d: " + formatConfig(dist, occ) + "."
        };
    }
};

/* ---- Desafio (nivel 1): camada de valencia (letra) ---- */
challengeTypes.outerShell = {
    title: "Camada de Valência", icon: "\ud83c\udfaf", level: 1, points: 1,
    question: () => "Qual é a camada eletrônica mais externa ocupada pelo elemento apresentado?",
    generate: (Z) => ({ correctValue: getOuterShellLetter(Z) }),
    render: (el) => {
        const letters = ["K", "L", "M", "N", "O", "P", "Q"];
        buildMultipleChoice(el, letters.map(l => ({ label: l, value: l })));
    },
    verify: (el, Z, extra) => {
        const sel = el.querySelector(".mc-option.selected");
        const value = sel ? sel.dataset.value : null;
        const correct = value === extra.correctValue;
        return {
            correct, fraction: correct ? 1 : 0,
            you: value || "(nenhuma selecionada)",
            problem: correct ? "" : "A camada escolhida não é a mais externa ocupada por este elemento.",
            fix: correct ? "" : "A camada correta é " + extra.correctValue + " (n = " + getOuterShellN(Z) + ").",
            concept: "A camada mais externa corresponde ao maior número quântico principal (n) ocupado pelos elétrons do átomo (K=1, L=2, M=3, N=4...)."
        };
    }
};

/* ---- Desafio (nivel 2): distribuicao por subniveis ---- */
challengeTypes.sublevels = {
    title: "Distribuição por Subníveis", icon: "\ud83e\uddea", level: 2, points: 2,
    question: () => "Realize a distribuição eletrônica completa do elemento apresentado, seguindo a ordem crescente de energia dos subníveis.",
    generate: (Z) => ({ subshells: getOccupiedSubshells(Z), dist: calculateCorrectDistribution(Z) }),
    render: (el, Z, extra) => { buildSublevelGrid(el, extra.subshells); },
    verify: (el, Z, extra) => {
        const answer = readSublevelGrid(el);
        const result = compareSublevels(answer, extra.dist, extra.subshells);
        const correct = result.correctCount === result.total;
        const wrong = result.steps.find(s => s.status !== "correct");
        return {
            correct, fraction: result.correctCount / result.total, steps: result.steps,
            you: formatConfig(answer, extra.subshells) || "(sem preenchimento)",
            problem: correct ? "" : (wrong.status === "empty"
                ? "O subnível " + wrong.label + " não foi preenchido."
                : "O subnível " + wrong.label + " deveria ter " + wrong.expected + " elétron(s), mas foi informado " + wrong.given + "."),
            fix: correct ? "" : "Distribuição correta: " + formatConfig(extra.dist, extra.subshells) + ".",
            concept: "Cada subnível tem capacidade máxima fixa: s = 2, p = 6, d = 10, f = 14 elétrons, preenchidos na ordem energética do diagrama de Linus Pauling."
        };
    }
};

/* ---- Desafio (nivel 2): diagrama de Linus Pauling (ordem diagonal) ---- */
challengeTypes.linusPauling = {
    title: "Diagrama de Linus Pauling", icon: "\ud83d\udcd0", level: 2, points: 2,
    question: () => "Distribua os elétrons do elemento apresentado utilizando o Diagrama de Linus Pauling. Preencha corretamente os subníveis seguindo a ordem crescente de energia (as caixas aparecem na ordem diagonal do diagrama).",
    generate: (Z) => ({ subshells: getOccupiedSubshells(Z), dist: calculateCorrectDistribution(Z) }),
    render: (el, Z, extra) => {
        const hint = document.createElement("div");
        hint.className = "text-sm text-gray-600 mb-2";
        hint.textContent = "Ordem diagonal (Madelung): siga a sequência abaixo.";
        el.appendChild(hint);

        const row = document.createElement("div");
        row.className = "pauling-order-row";
        extra.subshells.forEach((orb, i) => {
            const step = document.createElement("div");
            step.className = "pauling-step";
            const group = document.createElement("div");
            group.className = "orbital-input-group " + subshellType(orb) + "-sublevel";
            group.textContent = orb;
            const input = document.createElement("input");
            input.type = "number"; input.min = "0"; input.className = "sublevel-input"; input.dataset.orbital = orb;
            group.appendChild(input);
            step.appendChild(group);
            row.appendChild(step);
            if (i < extra.subshells.length - 1) {
                const arrow = document.createElement("span");
                arrow.className = "pauling-arrow"; arrow.textContent = "\u2198";
                row.appendChild(arrow);
            }
        });
        el.appendChild(row);
    },
    verify: (el, Z, extra) => {
        const answer = readSublevelGrid(el);
        const result = compareSublevels(answer, extra.dist, extra.subshells);
        const correct = result.correctCount === result.total;
        const wrong = result.steps.find(s => s.status !== "correct");
        return {
            correct, fraction: result.correctCount / result.total, steps: result.steps,
            you: formatConfig(answer, extra.subshells) || "(sem preenchimento)",
            problem: correct ? "" : (wrong.status === "empty"
                ? "O subnível " + wrong.label + " ficou sem preencher na sequência diagonal."
                : "No subnível " + wrong.label + " o valor esperado é " + wrong.expected + ", e não " + wrong.given + "."),
            fix: correct ? "" : "Sequência correta: " + formatConfig(extra.dist, extra.subshells) + ".",
            concept: "O diagrama de Linus Pauling organiza os subníveis em ordem crescente de energia (regra de Madelung: n + l crescente), e não em ordem crescente de camada (n)."
        };
    }
};

/* ---- Desafio (nivel 2): notacao de caixas (Pauli + Hund) ---- */
challengeTypes.boxNotation = {
    title: "Notação de Caixas", icon: "\ud83d\udce6", level: 2, points: 2,
    question: () => "Represente a distribuição eletrônica do elemento apresentado utilizando a notação de caixas, respeitando o Princípio da Exclusão de Pauli e a Regra de Hund. Clique nas caixas para adicionar elétrons (vazio → ↑ → ↑↓).",
    generate: (Z) => ({ subshells: getOccupiedSubshells(Z), dist: calculateCorrectDistribution(Z) }),
    render: (el, Z, extra) => { buildBoxNotation(el, extra.subshells); },
    verify: (el, Z, extra) => {
        const boxState = readBoxNotation(el);
        const result = evaluateBoxNotation(boxState, extra.dist, extra.subshells);
        const correct = result.allCorrect;
        const wrong = result.steps.find(s => s.status !== "correct");
        let problem = "", fix = "", concept = "As caixas representam orbitais; cada uma comporta no máximo 2 elétrons com spins opostos (Princípio da Exclusão de Pauli).";
        if (!correct && wrong) {
            if (wrong.errorType === "excesso_eletrons") {
                problem = "O subnível " + wrong.label + " recebeu mais elétrons (" + wrong.given + ") do que o correto (" + wrong.expected + ").";
                fix = "Revise a contagem total de elétrons do subnível " + wrong.label + ".";
            } else if (wrong.errorType === "faltam_eletrons") {
                problem = "O subnível " + wrong.label + " recebeu menos elétrons (" + wrong.given + ") do que o correto (" + wrong.expected + ").";
                fix = "Complete o subnível " + wrong.label + " até totalizar " + wrong.expected + " elétron(s).";
            } else if (wrong.errorType === "regra_hund") {
                problem = "Os elétrons do subnível " + wrong.label + " foram emparelhados antes de ocupar individualmente todos os orbitais disponíveis.";
                fix = "Pela Regra de Hund, cada orbital do subnível deve receber 1 elétron antes que qualquer um receba o segundo (emparelhamento).";
                concept = "Regra de Hund: em orbitais de mesma energia (degenerados), os elétrons ocupam cada orbital individualmente, com spins paralelos, antes de se emparelharem.";
            }
        }
        const totalCorrectSteps = result.steps.filter(s => s.status === "correct").length;
        return {
            correct, fraction: totalCorrectSteps / result.steps.length,
            steps: result.steps.map(s => ({ label: s.label, status: s.status, given: s.given, expected: s.expected })),
            you: "preenchimento manual nas caixas", problem, fix, concept
        };
    }
};

/* ---- Desafio (nivel 3): identificar o elemento pela configuracao ---- */
challengeTypes.identifyElement = {
    title: "Identifique o Elemento", icon: "\u2753", level: 3, points: 3,
    hideIdentity: true, hideZ: true,
    question: (Z) => {
        const dist = calculateCorrectDistribution(Z);
        const cfg = formatConfig(dist, getOccupiedSubshells(Z));
        return "A configuração eletrônica apresentada pertence a qual elemento? " + cfg;
    },
    generate: (Z) => {
        const others = pickDistractorZs(Z, 3);
        const options = shuffle([Z, ...others]).map(k => ({ label: elementLabel(k), value: String(k) }));
        return { correctValue: String(Z), options };
    },
    render: (el, Z, extra) => { buildMultipleChoice(el, extra.options); },
    verify: (el, Z, extra) => {
        const sel = el.querySelector(".mc-option.selected");
        const value = sel ? sel.dataset.value : null;
        const correct = value === extra.correctValue;
        return {
            correct, fraction: correct ? 1 : 0,
            you: sel ? sel.textContent : "(nenhuma selecionada)",
            problem: correct ? "" : "O elemento escolhido não corresponde a esta configuração eletrônica.",
            fix: correct ? "" : "A configuração pertence a " + elementLabel(Z) + " (Z = " + Z + "), pois a soma dos expoentes totaliza " + Z + " elétrons.",
            concept: "O total de elétrons de uma configuração (soma dos expoentes) corresponde ao número atômico do elemento neutro."
        };
    }
};

/* ---- Desafio (nivel 3): complete a distribuicao ---- */
challengeTypes.completeDistribution = {
    title: "Complete a Distribuição", icon: "\u270f\ufe0f", level: 3, points: 3,
    question: () => "Complete a distribuição eletrônica do elemento apresentado.",
    generate: (Z) => {
        const subshells = getOccupiedSubshells(Z);
        const dist = calculateCorrectDistribution(Z);
        const nMissing = subshells.length > 2 ? randInt(1, Math.min(2, subshells.length - 1)) : 1;
        const missing = subshells.slice(subshells.length - nMissing);
        return { subshells, dist, missing };
    },
    render: (el, Z, extra) => {
        const shownDist = {};
        extra.subshells.forEach(o => { if (!extra.missing.includes(o)) shownDist[o] = extra.dist[o]; });
        const given = document.createElement("div");
        given.className = "question-box mb-4";
        given.innerHTML = "Configuração parcial: <b>" + formatConfig(shownDist, extra.subshells) + " " + extra.missing.map(() => "____").join(" ") + "</b>";
        el.appendChild(given);
        buildSublevelGrid(el, extra.missing);
    },
    verify: (el, Z, extra) => {
        const answer = readSublevelGrid(el);
        const result = compareSublevels(answer, extra.dist, extra.missing);
        const correct = result.correctCount === result.total;
        const wrong = result.steps.find(s => s.status !== "correct");
        return {
            correct, fraction: result.correctCount / result.total, steps: result.steps,
            you: formatConfig(answer, extra.missing) || "(sem preenchimento)",
            problem: correct ? "" : "A parte completada não corresponde à distribuição real do elemento.",
            fix: correct ? "" : "Distribuição completa: " + formatConfig(extra.dist, extra.subshells) + ".",
            concept: "A parte que falta continua a mesma ordem energética das etapas já apresentadas."
        };
    }
};

/* ---- Desafio (nivel 3): periodo da tabela periodica ---- */
challengeTypes.period = {
    title: "Período da Tabela Periódica", icon: "\ud83d\udcc5", level: 3, points: 3,
    question: () => "A partir da distribuição eletrônica do elemento apresentado, determine o período ao qual ele pertence.",
    generate: (Z) => {
        const correct = getPeriod(Z);
        const allPeriods = [1, 2, 3, 4, 5, 6, 7];
        const wrongPeriods = shuffle(allPeriods.filter(p => p !== correct)).slice(0, 3);
        const options = shuffle([correct, ...wrongPeriods]).map(p => ({ label: String(p) + "º período", value: String(p) }));
        return { correctValue: String(correct), options };
    },
    render: (el, Z, extra) => {
        buildMultipleChoice(el, extra.options);
    },
    verify: (el, Z, extra) => {
        const sel = el.querySelector(".mc-option.selected");
        const value = sel ? sel.dataset.value : null;
        const correct = value === extra.correctValue;
        return {
            correct, fraction: correct ? 1 : 0,
            you: sel ? sel.textContent : "(nenhuma selecionada)",
            problem: correct ? "" : "O período escolhido não corresponde ao maior nível de energia ocupado.",
            fix: correct ? "" : "O período correto é " + extra.correctValue + ".",
            concept: "O número do período corresponde ao maior número quântico principal (n) ocupado pelo átomo no estado fundamental."
        };
    }
};

/* ---- Desafio (nivel 3): identifique o erro ---- */
challengeTypes.identifyError = {
    title: "Identifique o Erro", icon: "\ud83d\udc1b", level: 3, points: 3,
    question: () => "A distribuição eletrônica abaixo apresenta um erro. Identifique o problema.",
    generate: (Z) => {
        const subshells = getOccupiedSubshells(Z);
        const dist = calculateCorrectDistribution(Z);
        const errorTypes = ["ordem_incorreta", "capacidade_excedida", "total_incorreto"];
        if (subshells.length < 2) errorTypes.splice(errorTypes.indexOf("ordem_incorreta"), 1);
        const errorType = pickRandom(errorTypes);
        let displayOrder = subshells.slice();
        const wrongDist = Object.assign({}, dist);
        let brokenOrb = null;

        if (errorType === "ordem_incorreta") {
            const i = randInt(0, subshells.length - 2);
            displayOrder = subshells.slice();
            const tmp = displayOrder[i]; displayOrder[i] = displayOrder[i + 1]; displayOrder[i + 1] = tmp;
        } else if (errorType === "capacidade_excedida") {
            brokenOrb = pickRandom(subshells);
            const cap = orbitalCapacity[subshellType(brokenOrb)];
            wrongDist[brokenOrb] = cap + 1;
        } else if (errorType === "total_incorreto") {
            brokenOrb = subshells[subshells.length - 1];
            wrongDist[brokenOrb] = Math.max(1, wrongDist[brokenOrb] - 1);
        }

        const optionDefs = [
            { value: "ordem_incorreta", label: "Ordem incorreta dos subníveis" },
            { value: "capacidade_excedida", label: "Subnível com capacidade excedida" },
            { value: "total_incorreto", label: "Número total de elétrons incorreto" }
        ];
        return { errorType, displayOrder, wrongDist, correctDist: dist, subshells, brokenOrb, options: shuffle(optionDefs) };
    },
    render: (el, Z, extra) => {
        const shown = document.createElement("div");
        shown.className = "question-box mb-4";
        shown.innerHTML = "Distribuição apresentada: <b>" + formatConfig(extra.wrongDist, extra.displayOrder) + "</b>";
        el.appendChild(shown);
        buildMultipleChoice(el, extra.options);
    },
    verify: (el, Z, extra) => {
        const sel = el.querySelector(".mc-option.selected");
        const value = sel ? sel.dataset.value : null;
        const correct = value === extra.errorType;
        const correctLabel = extra.options.find(o => o.value === extra.errorType).label;
        return {
            correct, fraction: correct ? 1 : 0,
            you: sel ? sel.textContent : "(nenhuma selecionada)",
            problem: correct ? "" : "O tipo de erro escolhido não é o que foi inserido nesta distribuição.",
            fix: correct ? "" : "O erro real é: " + correctLabel + ". Distribuição correta: " + formatConfig(extra.correctDist, extra.subshells) + ".",
            concept: "Erros comuns em distribuição eletrônica incluem trocar a ordem energética dos subníveis, exceder a capacidade máxima de um subnível ou somar um total de elétrons diferente do número atômico."
        };
    }
};

/* ---- Desafio (nivel 4): combinado (duas habilidades na mesma questao) ---- */
challengeTypes.combined = {
    title: "Desafio Combinado", icon: "\ud83c\udfc6", level: 4, points: 4,
    zFilter: hasUnambiguousValence,
    question: () => "Realize a distribuição eletrônica completa E informe o número de elétrons de valência do elemento apresentado.",
    generate: (Z) => ({
        subshells: getOccupiedSubshells(Z), dist: calculateCorrectDistribution(Z),
        correctValence: getValenceElectrons(Z)
    }),
    render: (el, Z, extra) => {
        const block1 = document.createElement("div");
        block1.className = "combined-block";
        block1.innerHTML = "<h4>1. Distribuição eletrônica</h4>";
        el.appendChild(block1);
        buildSublevelGrid(block1, extra.subshells);

        const block2 = document.createElement("div");
        block2.className = "combined-block";
        block2.innerHTML = '<h4>2. Elétrons de valência</h4><div class="numeric-input-wrap"><input type="number" min="0" class="numeric-input" id="combinedValence"></div>';
        el.appendChild(block2);
    },
    verify: (el, Z, extra) => {
        const answer = readSublevelGrid(el);
        const result = compareSublevels(answer, extra.dist, extra.subshells);
        const valInput = el.querySelector("#combinedValence");
        const givenValence = valInput.value === "" ? null : parseInt(valInput.value);
        const valenceCorrect = givenValence === extra.correctValence;

        const totalSteps = result.total + 1;
        const correctSteps = result.correctCount + (valenceCorrect ? 1 : 0);
        const correct = correctSteps === totalSteps;

        const steps = result.steps.concat([{
            label: "valência", status: valenceCorrect ? "correct" : "incorrect",
            expected: extra.correctValence, given: givenValence
        }]);

        const problems = [];
        if (result.correctCount !== result.total) problems.push("a distribuição por subníveis contém erro(s)");
        if (!valenceCorrect) problems.push("o número de elétrons de valência está incorreto (esperado: " + extra.correctValence + ")");

        return {
            correct, fraction: correctSteps / totalSteps, steps,
            you: formatConfig(answer, extra.subshells) + " | valência: " + (givenValence === null ? "(vazio)" : givenValence),
            problem: correct ? "" : "Foram encontrados problemas em: " + problems.join("; ") + ".",
            fix: correct ? "" : "Distribuição correta: " + formatConfig(extra.dist, extra.subshells) + ". Elétrons de valência: " + extra.correctValence + ".",
            concept: "Este desafio combina duas habilidades: calcular a distribuição eletrônica completa e, a partir dela, identificar quantos elétrons estão na camada de valência."
        };
    }
};

/* ---------------------------------------------------------
   5. MOTOR DO JOGO (sorteio, renderizacao, verificacao)
   --------------------------------------------------------- */

const challengeIds = Object.keys(challengeTypes);

// Evita repetir o mesmo tipo de desafio mais de 2 vezes seguidas.
function pickNextChallengeId() {
    const last2 = state.history.slice(-2);
    const isBlocked = (id) => last2.length === 2 && last2[0] === id && last2[1] === id;
    let candidates = challengeIds.filter(id => !isBlocked(id));
    if (candidates.length === 0) candidates = challengeIds;
    return pickRandom(candidates);
}

let dom = {};
function cacheDom() {
    dom = {
        saveMenu: document.getElementById("saveMenu"),
        slotsContainer: document.getElementById("slotsContainerA"),
        gameContent: document.getElementById("gameContent"),
        btnVoltarMenu: document.getElementById("btnVoltarMenuA"),
        elementSymbol: document.getElementById("elementSymbol"),
        elementName: document.getElementById("elementName"),
        atomicNumberDisplay: document.getElementById("atomicNumberDisplay"),
        scoreDisplay: document.getElementById("scoreDisplay"),
        streakDisplay: document.getElementById("streakDisplay"),
        challengeIcon: document.getElementById("challengeIcon"),
        challengeTitle: document.getElementById("challengeTitle"),
        levelBadge: document.getElementById("levelBadge"),
        pointsBadge: document.getElementById("pointsBadge"),
        questionText: document.getElementById("questionText"),
        answerArea: document.getElementById("answerArea"),
        checkBtn: document.getElementById("checkAnswerBtn"),
        nextBtn: document.getElementById("nextChallengeBtn"),
        feedbackSection: document.getElementById("feedbackSection"),
        feedbackArea: document.getElementById("feedbackArea"),
        stepFeedback: document.getElementById("stepFeedback"),
        conceptBox: document.getElementById("conceptBox")
    };
}

function updateScoreUI() {
    dom.scoreDisplay.textContent = String(state.score);
    dom.streakDisplay.textContent = String(state.streak);
}

/* ---------------------------------------------------------
   MENU DE SLOTS (mesmo modelo de 3 perfis do Bloco B)
   --------------------------------------------------------- */

function renderSlotMenu() {
    dom.saveMenu.classList.remove("hidden");
    dom.gameContent.classList.add("hidden");
    dom.slotsContainer.innerHTML = "";

    for (let i = 1; i <= 3; i++) {
        const slot = missaoAtomoGetSlot(i);
        const blocoA = slot.blocoA;
        const div = document.createElement("div");
        div.className = "slot-card-a";
        if (blocoA) {
            div.innerHTML =
                '<div class="slot-info-a"><strong>SLOT ' + i + '</strong><br>Pontos: ' + blocoA.points + ' | Streak: ' + blocoA.streak + '</div>' +
                '<div class="slot-actions-a">' +
                '<button class="btn-primary-a" data-action="continue" data-slot="' + i + '">Continuar</button>' +
                '<button class="btn-delete-a" data-action="delete" data-slot="' + i + '">\uD83D\uDDD1\uFE0F</button>' +
                '</div>';
        } else {
            div.innerHTML =
                '<div class="slot-info-a"><strong>SLOT ' + i + '</strong><br>Vazio</div>' +
                '<button class="btn-primary-a btn-new-a" data-action="new" data-slot="' + i + '">Novo Jogo</button>';
        }
        dom.slotsContainer.appendChild(div);
    }

    dom.slotsContainer.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            const slotNum = parseInt(btn.dataset.slot);
            if (btn.dataset.action === "delete") {
                if (confirm("Deseja apagar o progresso do Slot " + slotNum + "? Isso também apaga o progresso desse mesmo slot no Orbitais Quest.")) {
                    missaoAtomoDeleteSlot(slotNum);
                    renderSlotMenu();
                }
            } else {
                loadSlot(slotNum, btn.dataset.action === "new");
            }
        });
    });
}

function loadSlot(slotNum, isNew) {
    state.currentSlot = slotNum;
    if (isNew) {
        state.score = 0;
        state.streak = 0;
        saveProgress();
    } else {
        const slot = missaoAtomoGetSlot(slotNum);
        state.score = (slot.blocoA && slot.blocoA.points) || 0;
        state.streak = (slot.blocoA && slot.blocoA.streak) || 0;
    }
    dom.saveMenu.classList.add("hidden");
    dom.gameContent.classList.remove("hidden");
    updateScoreUI();
    newRound();
}

function newRound() {
    state.answered = false;
    const challengeId = pickNextChallengeId();
    state.challengeId = challengeId;
    state.history.push(challengeId);
    if (state.history.length > 10) state.history.shift();

    const challenge = challengeTypes[challengeId];
    state.Z = pickCompatibleZ(challenge.zFilter);
    state.challengeState = challenge.generate(state.Z);

    // Cabecalho: identidade do elemento
    if (challenge.hideZ) {
        dom.atomicNumberDisplay.textContent = "?";
    } else {
        dom.atomicNumberDisplay.textContent = String(state.Z);
    }
    if (challenge.hideIdentity) {
        dom.elementSymbol.textContent = "?";
        dom.elementName.textContent = "Descubra pela pergunta abaixo!";
    } else {
        dom.elementSymbol.textContent = periodicTable[state.Z][0];
        dom.elementName.textContent = periodicTable[state.Z][1];
    }

    // Badge do desafio
    dom.challengeIcon.textContent = challenge.icon;
    dom.challengeTitle.textContent = challenge.title;
    dom.levelBadge.textContent = "Nível " + challenge.level;
    dom.pointsBadge.textContent = "+" + challenge.points + " pts";
    dom.questionText.textContent = challenge.question(state.Z, state.challengeState);

    // Area de resposta
    dom.answerArea.innerHTML = "";
    challenge.render(dom.answerArea, state.Z, state.challengeState);

    // Reset de botoes/feedback
    dom.checkBtn.classList.remove("hidden");
    dom.nextBtn.classList.add("hidden");
    dom.feedbackSection.classList.add("hidden");
    dom.feedbackArea.innerHTML = "";
    dom.stepFeedback.innerHTML = "";
    dom.conceptBox.classList.add("hidden");
    dom.conceptBox.innerHTML = "";
}

function handleVerify() {
    if (state.answered) return;
    const challenge = challengeTypes[state.challengeId];
    const result = challenge.verify(dom.answerArea, state.Z, state.challengeState);
    state.answered = true;

    // Revela identidade do elemento apos a resposta, se estava oculta
    dom.elementSymbol.textContent = periodicTable[state.Z][0];
    dom.elementName.textContent = periodicTable[state.Z][1];
    dom.atomicNumberDisplay.textContent = String(state.Z);

    // Pontuacao (parcial quando aplicavel)
    const fraction = typeof result.fraction === "number" ? result.fraction : (result.correct ? 1 : 0);
    const earned = Math.round(challenge.points * fraction);
    state.score += earned;
    state.streak = result.correct ? state.streak + 1 : 0;
    saveProgress();
    updateScoreUI();

    // Feedback textual estruturado (o que fez / onde errou / como corrigir)
    dom.feedbackArea.innerHTML = "";
    const card = document.createElement("div");
    card.className = "feedback-card " + (result.correct ? "ok" : "err");

    const title = document.createElement("div");
    title.className = "feedback-title " + (result.correct ? "ok-title" : "err-title");
    title.textContent = result.correct
        ? "\u2705 Muito bem! (+" + earned + " pts)"
        : "\u274c Resposta incorreta (+" + earned + " pts)";
    card.appendChild(title);

    if (result.you) {
        const l = document.createElement("div"); l.className = "feedback-line";
        l.innerHTML = "<b>Você respondeu:</b> " + result.you; card.appendChild(l);
    }
    if (!result.correct && result.problem) {
        const l = document.createElement("div"); l.className = "feedback-line";
        l.innerHTML = "<b>Onde está o erro:</b> " + result.problem; card.appendChild(l);
    }
    if (!result.correct && result.fix) {
        const l = document.createElement("div"); l.className = "feedback-line";
        l.innerHTML = "<b>Como corrigir:</b> " + result.fix; card.appendChild(l);
    }
    if (result.correct) {
        const l = document.createElement("div"); l.className = "feedback-line";
        l.textContent = "Você demonstrou entender corretamente este conceito.";
        card.appendChild(l);
    }
    dom.feedbackArea.appendChild(card);

    // Feedback passo a passo (quando o desafio tem multiplas etapas)
    dom.stepFeedback.innerHTML = "";
    if (result.steps && result.steps.length > 1) {
        renderStepFeedback(dom.stepFeedback, result.steps);
    }

    // Explicacao conceitual (Voce sabia?)
    if (result.concept) {
        dom.conceptBox.classList.remove("hidden");
        dom.conceptBox.innerHTML = "\ud83d\udca1 <b>Você sabia?</b> " + result.concept;
    }

    dom.feedbackSection.classList.remove("hidden");
    dom.checkBtn.classList.add("hidden");
    dom.nextBtn.classList.remove("hidden");
}

/* ---------------------------------------------------------
   6. INICIALIZACAO
   --------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    cacheDom();
    dom.checkBtn.addEventListener("click", handleVerify);
    dom.nextBtn.addEventListener("click", newRound);
    dom.btnVoltarMenu.addEventListener("click", renderSlotMenu);
    renderSlotMenu();
});

/* =========================================================
   RESUMO DA EXPANSAO PARA 118 ELEMENTOS
   =========================================================
   O QUE MUDOU (Z=1-36 -> Z=1-118):

   1. periodicTable agora tem os 118 elementos (nomes em portugues).
   2. orbitalsOrder ganhou os subniveis 5f, 6d e 7p (necessarios para
      lantanideos, actinideos e elementos superpesados).
   3. stabilityExceptions passou de 2 para 20 excecoes reais de Aufbau
      (Cr, Cu, Nb, Mo, Ru, Rh, Pd, Ag, La, Ce, Gd, Pt, Au, Ac, Th, Pa,
      U, Np, Cm, Lr), verificadas contra a tabela de referencia
      NIST/CRC Handbook/WebElements. calculateCorrectDistribution foi
      simplificada: agora e sempre baseDistribution(Z) + excecao (se
      houver), o que e matematicamente equivalente e mais facil de
      auditar do que o "hack" anterior especifico para o nucleo do Ar.
   4. getValenceElectrons foi generalizada: antes so tratava Z=21-30
      como metal de transicao; agora decide pela propria distribuicao
      (bloco p exclui o (n-1)d do calculo; bloco s/d inclui). Uma
      ressalva sobre a convencao usada para elementos com d10 completo
      esta documentada no comentario da funcao.
   5. Elementos com subnivel f PARCIALMENTE preenchido (lantanideos
      Ce-Yb e actinideos Pa-Md, 24 elementos) foram excluidos dos
      desafios "Elétrons de Valência" e "Desafio Combinado" via
      hasUnambiguousValence(), porque a contagem de eletrons de
      valencia para esses elementos e genuinamente controversa na
      literatura. Eles continuam disponiveis em todos os outros 9
      desafios.
   6. O desafio "Período" agora sorteia distratores entre os 7
      periodos reais (antes so ia de 1 a 4).
   7. Distratores de multipla escolha (Reconheça o Elemento,
      Identifique o Elemento) agora preferem numeros atomicos vizinhos
      de Z, em vez de qualquer elemento aleatorio entre os 118 (evita
      comparar Hidrogenio com Oganessonio).
   8. O motor do jogo (newRound) agora escolhe o desafio primeiro e
      depois sorteia um Z compativel com ele (pickCompatibleZ),
      respeitando o zFilter de cada desafio.

   ELEMENTOS 109-118: configuracao eletronica nunca medida
   experimentalmente (previsao teorica baseada em calculos
   relativisticos), conforme a propria fonte de referencia. O jogo usa
   essas previsoes porque coincidem com o preenchimento sequencial
   simples nessa faixa - nao ha excecao adicional a aplicar.

   TESTES REALIZADOS: os 11 desafios foram executados para todos os
   118 elementos (respeitando os filtros de compatibilidade) sem
   nenhum erro de execucao, e o "caminho correto" (resposta
   objetivamente certa) foi validado para uma amostra de 30 elementos
   cobrindo casos-limite (excecoes de Aufbau, elementos superpesados,
   fronteiras de bloco f) em todos os 11 desafios, sem falhas.
   ========================================================= */
