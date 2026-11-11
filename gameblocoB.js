// ============================================
// ORBITAIS QUEST - VERSÃO COMPLETA COM SISTEMA ANTI-FARM
// ============================================

class OrbitaisQuest {
    constructor() {
        this.currentSlot = null;
        this.currentWorld = 1;
        this.selectedWorld = null;
        this.currentQuestion = 0;
        this.score = 0;
        this.streak = 0;
        this.worldCorrectCount = 0;
        this.worldStats = {
            1: {correct: 0, total: 0}, 2: {correct: 0, total: 0}, 
            3: {correct: 0, total: 0}, 4: {correct: 0, total: 0}, 5: {correct: 0, total: 0}
        };
        this.questionsPerWorld = 8;
        
        // --- ANTI-FARM: Registro de perguntas já pontuadas ---
        this.answeredQuestions = {}; 

        this.questions = this.loadQuestions();
        this.summaries = this.loadWorldSummaries();
        this.init();
    }

    init() {
        this.renderSaveMenu();
        this.bindEvents();
    }

    // --- BANCO DE DADOS DE RESUMOS ---
    loadWorldSummaries() {
        return {
            1: `
                <h3>Subníveis de Energia (s, p, d, f)</h3>
                <p>Cada nível de energia (camada) se divide em <strong>subníveis</strong>, identificados pelas letras s, p, d, f. Cada subnível tem uma forma e uma capacidade máxima de elétrons:</p>
                <img src="assets/orbitais-formas.svg" alt="Formas dos orbitais s, p, d e f" style="max-width:100%; margin:12px 0;">
                <ul>
                    <li><strong>s</strong> — formato esférico — 1 orbital — até <strong>2 elétrons</strong></li>
                    <li><strong>p</strong> — formato de haltere — 3 orbitais — até <strong>6 elétrons</strong></li>
                    <li><strong>d</strong> — formato de trevo — 5 orbitais — até <strong>10 elétrons</strong></li>
                    <li><strong>f</strong> — formato complexo — 7 orbitais — até <strong>14 elétrons</strong></li>
                </ul>
                <p>Outros pontos importantes:</p>
                <ul>
                    <li>O número antes da letra (ex.: no <strong>3d</strong>) é o <strong>número quântico principal (n)</strong>, que indica o nível de energia.</li>
                    <li>Cada <strong>orbital</strong> comporta no máximo <strong>2 elétrons</strong> com spins opostos (Princípio da Exclusão de Pauli).</li>
                    <li>Dentro do mesmo nível n, a energia cresce na ordem <strong>s &lt; p &lt; d &lt; f</strong>.</li>
                    <li>A capacidade máxima de elétrons por nível principal é dada pela fórmula <strong>2n²</strong>.</li>
                </ul>`,

            2: `
                <h3>A Regra n + l (Diagrama de Madelung)</h3>
                <p>Para saber a ordem em que os subníveis são preenchidos, somamos o número quântico principal (<strong>n</strong>) com o número quântico secundário (<strong>l</strong>), onde <strong>s = 0, p = 1, d = 2, f = 3</strong>.</p>
                <img src="assets/madelung-diagrama.svg" alt="Diagrama da regra n+l mostrando a ordem de preenchimento" style="max-width:100%; margin:12px 0; background:#fff; border-radius:8px; padding:8px;">
                <ul>
                    <li><strong>Regra principal:</strong> quanto maior a soma <strong>n + l</strong>, maior a energia (e mais tarde o subnível é preenchido).</li>
                    <li><strong>Critério de desempate:</strong> se dois subníveis têm o mesmo valor de n+l (por exemplo, 2p e 3s, ambos = 3), preenche primeiro o que tiver <strong>menor n</strong>.</li>
                    <li>Exemplo clássico: <strong>4s (n+l=4)</strong> tem menos energia que <strong>3d (n+l=5)</strong>, por isso o 4s é preenchido antes do 3d — mesmo o 3d tendo n menor!</li>
                    <li>Os números dentro dos círculos do diagrama acima mostram a ordem real de preenchimento (1º, 2º, 3º...).</li>
                </ul>`,

            3: `
                <h3>Diagrama de Linus Pauling — Construindo a Distribuição</h3>
                <p>O diagrama de Linus Pauling organiza visualmente a ordem de preenchimento dos subníveis (a mesma ordem obtida pela regra n+l):</p>
                <img src="diagrama.png" alt="Diagrama de Linus Pauling" style="max-width:100%; margin:12px 0; border-radius:8px;">
                <p><strong>Ordem de preenchimento:</strong> 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶ 5s² 4d¹⁰ 5p⁶ 6s² 4f¹⁴ 5d¹⁰ 6p⁶ 7s² 5f¹⁴ 6d¹⁰ 7p⁶</p>
                <p>Para montar a distribuição de um elemento:</p>
                <ul>
                    <li>Siga a ordem do diagrama, preenchendo cada subnível até sua capacidade máxima antes de passar ao próximo.</li>
                    <li>Pare quando o total de elétrons distribuídos for igual ao número atômico (Z) do elemento.</li>
                    <li>Exemplo: <strong>Ferro (Z=26)</strong> → [Ar] <strong>4s² 3d⁶</strong> (o 4s vem antes do 3d, mesmo escrevendo o 3d depois na forma condensada por convenção).</li>
                    <li>Não pule subníveis nem troque a ordem — um erro comum é escrever 3p antes de completar o 3s, por exemplo.</li>
                </ul>`,

            4: `
                <h3>Notação Abreviada com Gases Nobres</h3>
                <p>Para configurações longas, usamos o símbolo do <strong>gás nobre anterior</strong> entre colchetes para representar todos os elétrons das camadas já completas, escrevendo apenas o restante.</p>
                <ul>
                    <li>Exemplo: em vez de <strong>1s² 2s² 2p⁶ 3s² 3p⁶</strong>, escrevemos <strong>[Ar]</strong> (Argônio), pois é exatamente essa configuração.</li>
                    <li>O Cálcio (Z=20) fica então: <strong>[Ar] 4s²</strong>.</li>
                    <li>O Criptônio (Z=36), um gás nobre, tem configuração completa: <strong>[Ar] 4s² 3d¹⁰ 4p⁶</strong> — todos os subníveis do período preenchidos.</li>
                </ul>
                <p>Cuidado com pegadinhas comuns:</p>
                <ul>
                    <li>Nunca escreva o subnível <strong>4p antes do 3d</strong> — a ordem de preenchimento continua valendo dentro da notação abreviada.</li>
                    <li>Nunca escreva o <strong>4s depois do 3d</strong> na ordem de preenchimento real (embora, por convenção de escrita, alguns livros reorganizem por camada).</li>
                    <li>O próprio símbolo do gás nobre (ex.: [Kr] sozinho para representar o Kriptônio) é uma tautologia — não mostra a distribuição.</li>
                </ul>
                <p>Este mundo também revisita as <strong>exceções de estabilidade</strong> do Cromo e do Cobre — veja os detalhes completos no Mundo 5.</p>`,

            5: `
                <h3>Exceções de Estabilidade: Cromo e Cobre</h3>
                <p>Alguns elementos "roubam" um elétron do subnível <strong>4s</strong> para deixar o <strong>3d semipreenchido (d⁵)</strong> ou <strong>completo (d¹⁰)</strong>, porque essas configurações são mais estáveis (menor repulsão eletrônica entre elétrons com spins paralelos).</p>
                <img src="assets/excecoes-estabilidade.svg" alt="Comparação entre a distribuição prevista e a real do Cromo e do Cobre" style="max-width:100%; margin:12px 0; background:#fff; border-radius:8px; padding:8px;">
                <ul>
                    <li><strong>Cromo (Z=24):</strong> em vez do previsto 4s² 3d⁴, a configuração real é <strong>4s¹ 3d⁵</strong> (subnível d semipreenchido, um elétron em cada orbital).</li>
                    <li><strong>Cobre (Z=29):</strong> em vez do previsto 4s² 3d⁹, a configuração real é <strong>4s¹ 3d¹⁰</strong> (subnível d completo).</li>
                </ul>
                <p>Essas exceções também importam na formação de <strong>íons</strong>:</p>
                <ul>
                    <li>Ao formar um cátion, os elétrons saem sempre da <strong>camada de valência</strong> (mais externa) primeiro.</li>
                    <li>Depois que o 4s está preenchido, ele passa a ter <strong>energia maior</strong> que o 3d — por isso, em íons, o <strong>4s perde elétrons antes do 3d</strong>.</li>
                    <li>Exemplo: o Cobre é [Ar] 4s¹ 3d¹⁰. Para formar <strong>Cu²⁺</strong>, ele perde o elétron do 4s e mais um do 3d, resultando em <strong>[Ar] 3d⁹</strong>.</li>
                </ul>`
        };
    }

    // --- SISTEMA DE SAVE POR SLOTS ---
    // (armazenamento unificado com o Bloco A via storage.js; cada slot guarda
    // separadamente o progresso do Bloco A e do Bloco B)
    getSaves() {
        const saves = missaoAtomoGetSaves();
        // Formato esperado por este arquivo: { slot1: blocoBData|null, ... }
        return {
            slot1: saves.slot1.blocoB,
            slot2: saves.slot2.blocoB,
            slot3: saves.slot3.blocoB
        };
    }

    renderSaveMenu() {
        document.getElementById('saveMenu').style.display = 'block';
        document.getElementById('gameContent').style.display = 'none';
        document.getElementById('worldIntro').style.display = 'none';
        
        const container = document.getElementById('slotsContainer');
        const saves = this.getSaves();
        container.innerHTML = '';

        for (let i = 1; i <= 3; i++) {
            const slot = saves[`slot${i}`];
            const div = document.createElement('div');
            div.className = 'slot-card';
            
            if (slot) {
                div.innerHTML = `
                    <div class="slot-info">
                        <strong>SLOT ${i}</strong><br>
                        Mundo: ${slot.currentWorld} | Pontos: ${slot.score}
                    </div>
                    <div class="slot-actions">
                        <button class="btn-primary" onclick="game.loadSlot(${i})">Continuar</button>
                        <button class="btn-delete" onclick="game.deleteSlot(${i})">🗑️</button>
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div class="slot-info"><strong>SLOT ${i}</strong><br>Vazio</div>
                    <button class="btn-primary btn-new" onclick="game.loadSlot(${i}, true)">Novo Jogo</button>
                `;
            }
            container.appendChild(div);
        }
    }

    loadSlot(slotNum, isNew = false) {
        this.currentSlot = slotNum;
        const saves = this.getSaves();

        if (isNew) {
            this.score = 0;
            this.currentWorld = 1;
            this.streak = 0;
            this.answeredQuestions = {}; // Reset anti-farm
            this.worldStats = {1: {correct: 0}, 2: {correct: 0}, 3: {correct: 0}, 4: {correct: 0}, 5: {correct: 0}};
            this.saveGameState();
        } else {
            const data = saves[`slot${slotNum}`];
            this.score = data.score;
            this.currentWorld = data.currentWorld;
            this.streak = data.streak;
            this.worldStats = data.worldStats;
            this.answeredQuestions = data.answeredQuestions || {}; // Carrega histórico
        }

        document.getElementById('saveMenu').style.display = 'none';
        document.getElementById('gameContent').style.display = 'block';
        this.updateUI();
        this.showWorldMap();
    }

    deleteSlot(slotNum) {
        if (confirm(`Deseja apagar o progresso do Slot ${slotNum}? Isso também apaga o progresso desse mesmo slot no Quiz de Distribuição Eletrônica.`)) {
            missaoAtomoDeleteSlot(slotNum);
            this.renderSaveMenu();
        }
    }

    saveGameState() {
        if (!this.currentSlot) return;
        missaoAtomoSaveBlocoB(this.currentSlot, {
            score: this.score,
            currentWorld: this.currentWorld,
            streak: this.streak,
            worldStats: this.worldStats,
            answeredQuestions: this.answeredQuestions // Salva o anti-farm
        });
    }

    // --- LÓGICA DE JOGO ---

    // Embaralha um array (Fisher-Yates) sem alterar o original
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    bindEvents() {
        document.querySelectorAll('.world').forEach(w => {
            w.onclick = () => this.startWorld(parseInt(w.dataset.world));
        });
        document.getElementById('startGameBtn').onclick = () => this.beginQuestions();
        document.getElementById('backToMapFromIntro').onclick = () => this.showWorldMap();
        document.getElementById('nextQuestion').onclick = () => this.nextQuestion();
        document.getElementById('backToMap').onclick = () => this.showWorldMap();
        document.getElementById('continueWorld').onclick = () => this.showWorldMap();
        document.getElementById('replayWorld').onclick = () => this.startWorld(this.selectedWorld);
        document.getElementById('btnVoltarMenu').onclick = () => this.renderSaveMenu();
    }

    showWorldMap() {
        document.getElementById('gameMain').style.display = 'none';
        document.getElementById('worldComplete').style.display = 'none';
        document.getElementById('worldIntro').style.display = 'none';
        document.getElementById('worldMap').style.display = 'block';
        this.updateWorldLocks();
    }

    startWorld(worldNum) {
        if (worldNum > this.currentWorld) return;
        this.selectedWorld = worldNum;
        document.getElementById('worldMap').style.display = 'none';
        document.getElementById('worldIntro').style.display = 'block';
        document.getElementById('introTitle').textContent = `Mundo ${worldNum}: Resumo`;
        document.getElementById('introText').innerHTML = this.summaries[worldNum];
    }

    beginQuestions() {
        document.getElementById('worldIntro').style.display = 'none';
        document.getElementById('gameMain').style.display = 'block';
        this.currentQuestion = 0;
        this.worldCorrectCount = 0;
        this.showQuestion();
        
    }

    showQuestion() {
        const q = this.questions[this.selectedWorld][this.currentQuestion];
        document.getElementById('questionNumber').textContent = `Pergunta ${this.currentQuestion + 1}/${this.questionsPerWorld}`;
        document.getElementById('questionText').innerHTML = q.question;
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';

        // Embaralha a ORDEM DE EXIBIÇÃO das alternativas a cada pergunta,
        // mas guarda o índice original de cada uma (data-idx) para validar a resposta.
        const displayOrder = this.shuffleArray(q.options.map((_, i) => i));

        displayOrder.forEach(originalIdx => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = q.options[originalIdx];
            btn.dataset.idx = originalIdx;
            btn.onclick = () => this.checkAnswer(originalIdx);
            container.appendChild(btn);
        });
        document.getElementById('feedbackArea').style.display = 'none';
        this.updateProgress();
    }

    checkAnswer(idx) {
        const q = this.questions[this.selectedWorld][this.currentQuestion];
        const feedback = document.getElementById('feedbackArea');
        const feedbackText = document.getElementById('feedbackText');
        const clickedBtn = document.querySelector(`.option-btn[data-idx="${idx}"]`);
        const correctBtn = document.querySelector(`.option-btn[data-idx="${q.correct}"]`);

        // Gerar ID único para a pergunta: "mundo-index"
        const questionId = `${this.selectedWorld}-${this.currentQuestion}`;

        document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

        if (idx === q.correct) {
            clickedBtn.style.background = '#4CAF50';
            clickedBtn.style.color = 'white';
            
            // --- LÓGICA ANTI-FARM ---
            if (!this.answeredQuestions[questionId]) {
                this.score += 100 + (this.streak * 10);
                this.streak++;
                this.answeredQuestions[questionId] = true; // Marca como respondida
            } else {
                // Se já respondeu antes, não ganha pontos nem aumenta streak
                console.log("Sistema Anti-Farm: Pontos ignorados para esta questão.");
            }
            
            this.worldCorrectCount++;
            feedbackText.innerHTML = `<div style="color: #2e7d32; font-weight: bold;">✨ Correto!</div><div>${q.explanation}</div>`;
        } else {
            clickedBtn.style.background = '#f44336';
            if (correctBtn) {
                correctBtn.style.background = '#4CAF50';
                correctBtn.style.color = 'white';
            }
            this.streak = 0;
            feedbackText.innerHTML = `<div style="color: #c62828; font-weight: bold;">❌ Incorreto.</div><div>${q.wrongExplanations[idx] || ""}</div>`;
        }

        feedback.style.display = 'block';
        this.updateUI();
        this.saveGameState();
    }

    nextQuestion() {
        this.currentQuestion++;
        if (this.currentQuestion < this.questionsPerWorld) this.showQuestion();
        else this.finishWorld();
    }

    finishWorld() {
        document.getElementById('gameMain').style.display = 'none';
        document.getElementById('worldComplete').style.display = 'block';
        document.getElementById('worldCorrect').textContent = this.worldCorrectCount;
        document.getElementById('worldScore').textContent = this.score;

        if (this.worldCorrectCount >= 5 && this.selectedWorld === this.currentWorld && this.currentWorld < 5) {
            this.currentWorld++;
            this.saveGameState();
        }
    }

    updateWorldLocks() {
        document.querySelectorAll('.world').forEach(w => {
            const num = parseInt(w.dataset.world);
            w.className = `world world-${num} ${num <= this.currentWorld ? 'unlocked' : 'locked'}`;
        });
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('currentWorld').textContent = this.currentWorld;
        document.getElementById('streak').textContent = this.streak;
    }

    updateProgress() {
        const progress = (this.currentQuestion / this.questionsPerWorld) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    loadQuestions() {
        return {
            1: [  // Mundo 1 - Subníveis
                 {
                    question: "Qual subnível tem formato esférico?",
                    options: ["p", "d", "s", "f"],
                    correct: 2,
                    explanation: "O subnível <strong>s</strong> tem formato esférico e comporta <strong>2 elétrons</strong>.",
                    wrongExplanations: [
                        "O subnível p tem 3 orbitais em forma de '8'.",
                        "O subnível d tem 5 orbitais complexos.",
                        "O subnível f tem 7 orbitais ainda mais complexos."
                    ]
                },
                {
                    question: "Quantos elétrons máximo comporta o subnível p?",
                    options: ["2", "6", "10", "14"],
                    correct: 1,
                    explanation: "Subnível <strong>p</strong> = 3 orbitais × 2 e⁻ = <strong>6 elétrons</strong>.",
                    wrongExplanations: [
                        "2 elétrons é a capacidade do subnível s.",
                        "10 elétrons é a capacidade do subnível d.",
                        "14 elétrons é a capacidade do subnível f."
                    ]
                },
                {
                    question: "Fórmula geral para capacidade de elétrons:",
                    options: ["2n", "2(n²)", "2l+1", "4l+2"],
                    correct: 1,
                    explanation: "Capacidade = <strong>2(n²)</strong> elétrons por nível principal n.",
                    wrongExplanations: [
                        "2n é incorreto. Ex: n=2 comporta 8 e⁻, não 4.",
                        "2l+1 é o número de orbitais, não elétrons.",
                        "4l+2 não existe na teoria orbital."
                    ]
                },
{
    question: "Quantos orbitais existem no subnível d?",
    options: ["3", "5", "7", "9"],
    correct: 1,
    explanation: "O subnível <strong>d</strong> possui <strong>5 orbitais</strong>.",
    wrongExplanations: [
        "3 orbitais correspondem ao subnível p.",
        "7 orbitais correspondem ao subnível f.",
        "9 orbitais não corresponde a nenhum subnível."
    ]
},
{
    question: "Qual subnível começa a ser preenchido após o 3p?",
    options: ["3d", "4s", "4p", "2d"],
    correct: 1,
    explanation: "Após o 3p, o próximo subnível é o <strong>4s</strong>, seguindo a ordem energética.",
    wrongExplanations: [
        "3d vem depois do 4s na ordem de energia.",
        "4p só é preenchido depois do 4s e 3d.",
        "O subnível 2d não existe."
    ]
},
{
    question: "Qual é o número quântico principal do subnível 3d?",
    options: ["1", "2", "3", "4"],
    correct: 2,
    explanation: "O número quântico principal é <strong>3</strong>, indicado pelo número antes da letra.",
    wrongExplanations: [
        "1 corresponde ao primeiro nível de energia.",
        "2 corresponde ao segundo nível.",
        "4 indicaria o quarto nível energético."
    ]
},
{
    question: "Quantos elétrons cabem em um único orbital?",
    options: ["1", "2", "3", "4"],
    correct: 1,
    explanation: "Cada orbital comporta no máximo <strong>2 elétrons</strong>, com spins opostos.",
    wrongExplanations: [
        "1 elétron é possível, mas não é o máximo.",
        "3 elétrons violaria o princípio de Pauli.",
        "4 elétrons não é permitido em um único orbital."
    ]
},
{
    question: "Qual subnível possui maior energia dentro do mesmo nível principal?",
    options: ["s", "p", "d", "f"],
    correct: 3,
    explanation: "Dentro do mesmo nível, a energia aumenta na ordem: <strong>s < p < d < f</strong>.",
    wrongExplanations: [
        "s é o subnível de menor energia.",
        "p tem energia intermediária.",
        "d é mais energético que p, mas menor que f."
    ]
}
             ],
            2: [ // Mundo 2 - Energia dos Subníveis (Regra n+l)
                {
                    question: "Pelo valor de n+l, qual orbital tem menor energia?",
                    options: ["3s (n+l=3+0=3)", "3p (n+l=3+1=4)", "2p (n+l=2+1=3)", "4s (n+l=4+0=4)"],
                    correct: 2,
                    explanation: "Entre iguais n+l, menor n vence. <strong>2p (n+l=3)</strong> < 3s (n+l=3).",
                    wrongExplanations: [
                        "3s também tem n+l=3, mas n=3 > n=2.",
                        "3p tem n+l=4 (maior energia).",
                        "4s tem n+l=4 (maior energia)."
                    ]
                },
                {
                    question: "Ordem crescente de energia (n+l):",
                    options: ["3d > 4s", "4s > 3d", "3p > 4s", "3s > 2p"],
                    correct: 1,
                    explanation: "<strong>4s (n+l=4)</strong> < 3d (n+l=5). Por isso 4s preenche ANTES de 3d!",
                    wrongExplanations: [
                        "Errado! 3d (n+l=5) > 4s (n+l=4).",
                        "3p (n+l=4) = 4s (n+l=4), mas 3p preenche antes.",
                        "3s (n+l=3) > 2p (n+l=3)? Não, 2p primeiro!"
                    ]
                },
{
    question: "Qual orbital será preenchido primeiro?",
    options: ["3d", "4s", "4p", "5s"],
    correct: 1,
    explanation: "Pelo critério n+l: <strong>4s (4+0=4)</strong> vem antes de 3d (3+2=5).",
    wrongExplanations: [
        "3d tem n+l=5, portanto maior energia.",
        "4p tem n+l=5, maior que 4s.",
        "5s tem n+l=5, também maior que 4s."
    ]
},
{
    question: "Entre 3p e 4s, qual tem menor energia?",
    options: ["3p", "4s", "São iguais", "Depende do elemento"],
    correct: 0,
    explanation: "<strong>3p (3+1=4)</strong> e 4s (4+0=4), mas menor n vence → 3p.",
    wrongExplanations: [
        "4s tem mesmo n+l, mas n maior.",
        "Não são iguais: critério de desempate é o n.",
        "Não depende do elemento nesse modelo."
    ]
},
{
    question: "Qual orbital tem maior energia?",
    options: ["2p", "3s", "3p", "4s"],
    correct: 3,
    explanation: "Comparando n+l: 2p=3, 3s=3, 3p=4, <strong>4s=4</strong>. Entre 3p e 4s, maior n → 4s.",
    wrongExplanations: [
        "2p tem n+l menor.",
        "3s tem n+l menor.",
        "3p empata com 4s, mas perde no n."
    ]
},
{
    question: "Qual sequência está correta (menor → maior energia)?",
    options: ["2p < 3s < 3p", "3s < 2p < 3p", "3p < 3s < 2p", "2p < 3p < 3s"],
    correct: 0,
    explanation: "2p (3) = 3s (3), mas n menor primeiro → <strong>2p < 3s < 3p</strong>.",
    wrongExplanations: [
        "3s não vem antes de 2p.",
        "Ordem completamente invertida.",
        "3p tem energia maior que 3s."
    ]
},
{
    question: "Qual orbital vem logo após o 4s?",
    options: ["3d", "4p", "5s", "2p"],
    correct: 0,
    explanation: "Após <strong>4s</strong>, vem <strong>3d</strong> (n+l=5).",
    wrongExplanations: [
        "4p vem depois do 3d.",
        "5s vem depois do 4p.",
        "2p já foi preenchido antes."
    ]
},
{
    question: "Qual orbital tem menor energia entre os seguintes?",
    options: ["4p", "3d", "5s", "4d"],
    correct: 1,
    explanation: "n+l: 4p=5, <strong>3d=5</strong>, 5s=5, 4d=6. Empate → menor n vence → 3d.",
    wrongExplanations: [
        "4p empata, mas tem n maior.",
        "5s empata, mas tem n maior.",
        "4d tem n+l maior."
    ]
}
            ],
            3: [ // Mundo 3 - Construção da Distribuição
                {
                    question: "Distribuição do Nitrogênio (Z=7):",
                    options: ["1s² 2s² 2p³", "1s² 2s² 2p⁵", "1s² 2p⁵", "1s² 2s¹ 2p⁴"],
                    correct: 0,
                    explanation: "Z=7: 1s² (2e⁻) + 2s² (2e⁻) + 2p³ (3e⁻) = <strong>1s² 2s² 2p³</strong>.",
                    wrongExplanations: [
                        "2p⁵ seria 9 elétrons (Z=9, Flúor).",
                        "Faltou 2s²!",
                        "Violou a ordem de preenchimento."
                    ]
                },
                {
                    question: "Ferro (Z=26) começa com:",
                    options: ["[Ar] 4s² 3d⁶", "[Ar] 3d⁸ 4s", "[Ar] 3d⁶ 4s²", "[Ar] 4s¹ 3d⁷"],
                    correct: 0,
                    explanation: "Ordem: [Ar] <strong>4s² 3d⁶</strong>. Lembre: 4s preenche ANTES de 3d!",
                    wrongExplanations: [
                        "3d preenche DEPOIS de 4s.",
                        "Correto seria 4s² 3d⁶, não invertido.",
                        "4s¹ incorreto para ferro."
                    ]
                },
{
    question: "Distribuição do Oxigênio (Z=8):",
    options: ["1s² 2s² 2p⁴", "1s² 2s² 2p⁶", "1s² 2p⁶", "1s² 2s¹ 2p⁵"],
    correct: 0,
    explanation: "Z=8: 1s² (2e⁻) + 2s² (2e⁻) + 2p⁴ (4e⁻) = <strong>1s² 2s² 2p⁴</strong>.",
    wrongExplanations: [
        "2p⁶ corresponderia ao Neônio (Z=10).",
        "Faltou o subnível 2s.",
        "Distribuição incorreta da ordem energética."
    ]
},
{
    question: "Distribuição do Sódio (Z=11):",
    options: ["1s² 2s² 2p⁶ 3s¹", "1s² 2s² 2p⁵ 3s²", "1s² 2s² 3s² 3p⁵", "1s² 2p⁶ 3s³"],
    correct: 0,
    explanation: "Z=11: até 2p⁶ (10e⁻) + 3s¹ = <strong>1s² 2s² 2p⁶ 3s¹</strong>.",
    wrongExplanations: [
        "2p⁵ corresponde a Z=9.",
        "Ordem de preenchimento está errada.",
        "3s não comporta 3 elétrons."
    ]
},
{
    question: "Distribuição do Magnésio (Z=12):",
    options: ["1s² 2s² 2p⁶ 3s²", "1s² 2s² 2p⁶ 3p²", "1s² 2s² 2p⁵ 3s³", "1s² 2p⁶ 3s²"],
    correct: 0,
    explanation: "Z=12: 10 elétrons até 2p⁶ + 2 elétrons em 3s = <strong>3s²</strong>.",
    wrongExplanations: [
        "3p só começa depois de 3s.",
        "Distribuição incorreta de elétrons.",
        "Faltou o subnível 2s."
    ]
},
{
    question: "Distribuição do Alumínio (Z=13):",
    options: ["1s² 2s² 2p⁶ 3s² 3p¹", "1s² 2s² 2p⁶ 3p³", "1s² 2s² 2p⁵ 3s² 3p²", "1s² 2s² 3s² 3p³"],
    correct: 0,
    explanation: "Z=13: após 3s², entra 1 elétron em 3p → <strong>3p¹</strong>.",
    wrongExplanations: [
        "Pulou o subnível 3s.",
        "Distribuição não respeita a ordem.",
        "Faltam elétrons no 2p."
    ]
},
{
    question: "Distribuição do Cloro (Z=17):",
    options: ["1s² 2s² 2p⁶ 3s² 3p⁵", "1s² 2s² 2p⁶ 3s² 3p³", "1s² 2s² 2p⁵ 3s² 3p⁶", "1s² 2p⁶ 3s² 3p⁵"],
    correct: 0,
    explanation: "Z=17: até 3s² (12e⁻) + 5 elétrons em 3p → <strong>3p⁵</strong>.",
    wrongExplanations: [
        "3p³ corresponde a Z=15.",
        "Distribuição incorreta dos elétrons.",
        "Faltou o subnível 2s."
    ]
},
{
    question: "Distribuição do Cálcio (Z=20):",
    options: ["1s² 2s² 2p⁶ 3s² 3p⁶ 4s²", "1s² 2s² 2p⁶ 3s² 3p⁶ 3d²", "1s² 2s² 2p⁶ 3p⁶ 4s²", "1s² 2p⁶ 3s² 3p⁶ 4s²"],
    correct: 0,
    explanation: "Z=20: após 3p⁶ (18e⁻), entram 2 elétrons em <strong>4s²</strong>.",
    wrongExplanations: [
        "3d só começa depois de 4s.",
        "Faltou o subnível 3s.",
        "Faltou o subnível 2s."
    ]
}
            ],
            4: [ // Mundo 4 - Desafios
                {
                    question: "Z=36 (Kripton):",
                    options: ["[Ar] 4s² 3d¹⁰ 4p⁶", "[Ar] 3d¹⁰ 4s² 4p⁶", "[Ar] 4p⁶ 3d¹⁰ 4s²", "[Kr]"],
                    correct: 0,
                    explanation: "Gás nobre: [Ar] <strong>4s² 3d¹⁰ 4p⁶</strong> = camada externa completa.",
                    wrongExplanations: [
                        "Ordem errada: 4s ANTES de 3d!",
                        "4p não preenche antes de 3d.",
                        "[Kr] é o próprio Kripton, tautologia."
                    ]
                },
{
    question: "Z=18 (Argônio):",
    options: ["[Ne] 3s² 3p⁶", "[Ne] 3s² 3p⁴", "[Ne] 3p⁶", "[Ar]"],
    correct: 0,
    explanation: "Z=18: <strong>[Ne] 3s² 3p⁶</strong> completa a camada de valência.",
    wrongExplanations: [
        "3p⁴ corresponde ao enxofre (Z=16).",
        "Faltou o subnível 3s.",
        "[Ar] é o próprio argônio."
    ]
},
{
    question: "Z=20 (Cálcio):",
    options: ["[Ar] 4s²", "[Ar] 3d²", "[Ar] 4p²", "[Ne] 3s² 3p⁶ 4s²"],
    correct: 0,
    explanation: "Após [Ar], entram 2 elétrons em <strong>4s²</strong>.",
    wrongExplanations: [
        "3d ainda não começou.",
        "4p vem depois de 3d.",
        "Forma expandida correta, mas não abreviada."
    ]
},
{
    question: "Z=25 (Manganês):",
    options: ["[Ar] 4s² 3d⁵", "[Ar] 3d⁷ 4s", "[Ar] 4s¹ 3d⁶", "[Ar] 3d⁵"],
    correct: 0,
    explanation: "Distribuição correta: <strong>[Ar] 4s² 3d⁵</strong>.",
    wrongExplanations: [
        "Ordem incorreta e número de elétrons errado.",
        "4s¹ não é estável nesse caso.",
        "Faltam elétrons no 4s."
    ]
},
{
    question: "Z=29 (Cobre):",
    options: ["[Ar] 4s¹ 3d¹⁰", "[Ar] 4s² 3d⁹", "[Ar] 3d¹⁰ 4s²", "[Ar] 4s² 3d¹⁰"],
    correct: 0,
    explanation: "Exceção! O cobre prefere <strong>4s¹ 3d¹⁰</strong> (subnível d completo).",
    wrongExplanations: [
        "Seria a previsão teórica, mas não a real.",
        "Ordem e ocupação incorretas.",
        "Número total de elétrons incorreto."
    ]
},
{
    question: "Z=24 (Cromo):",
    options: ["[Ar] 4s¹ 3d⁵", "[Ar] 4s² 3d⁴", "[Ar] 3d⁶ 4s", "[Ar] 4s² 3d⁵"],
    correct: 0,
    explanation: "Exceção: <strong>4s¹ 3d⁵</strong> garante maior estabilidade (meio cheio).",
    wrongExplanations: [
        "Distribuição prevista, mas não a real.",
        "Ordem incorreta.",
        "Número de elétrons errado."
    ]
},
{
    question: "Z=35 (Bromo):",
    options: ["[Ar] 4s² 3d¹⁰ 4p⁵", "[Ar] 4s² 3d⁸ 4p⁷", "[Ar] 3d¹⁰ 4p⁵", "[Ne] 3s² 3p⁵"],
    correct: 0,
    explanation: "Z=35: após 3d¹⁰, entra em 4p → <strong>4p⁵</strong>.",
    wrongExplanations: [
        "Número de elétrons inválido.",
        "Faltou o 4s².",
        "Configuração de outro período."
    ]
},
{
    question: "Z=30 (Zinco):",
    options: ["[Ar] 4s² 3d¹⁰", "[Ar] 4s¹ 3d¹¹", "[Ar] 3d¹⁰ 4s¹", "[Ar] 4p²"],
    correct: 0,
    explanation: "Z=30: configuração estável <strong>[Ar] 4s² 3d¹⁰</strong>.",
    wrongExplanations: [
        "3d não comporta 11 elétrons.",
        "Faltou um elétron no 4s.",
        "4p ainda não começou."
    ]
}
            ],
            5: [ // Mundo 5 - Exceções
                {
                    question: "Por que Cromo (Z=24) é [Ar] 4s¹ 3d⁵?",
                    options: ["Meio-cheio d é mais estável", "Erro de preenchimento", "4s tem menor energia", "Regra n+l invertida"],
                    correct: 0,
                    explanation: "Subnível <strong>d meio-cheio (3d⁵)</strong> + 4s¹ é mais estável que 4s² 3d⁴.",
                    wrongExplanations: [
                        "Não é erro, é exceção por estabilidade!",
                        "4s tem menor energia, mas exceção ocorre.",
                        "n+l continua válido (4s=4, 3d=5)."
                    ]
                },
                {
                    question: "Cobre (Z=29):",
                    options: ["[Ar] 4s¹ 3d¹⁰", "[Ar] 4s² 3d⁹", "[Ar] 3d¹⁰ 4s¹", "[Ar] 4s² 3d⁸ 4p¹"],
                    correct: 0,
                    explanation: "<strong>d¹⁰ completo</strong> (4s¹ 3d¹⁰) mais estável que 4s² 3d⁹.",
                    wrongExplanations: [
                        "Regra padrão, sem exceção.",
                        "Ordem invertida incorreta.",
                        "4p não participa."]
                },
{
    question: "Por que subníveis meio-cheios são estáveis?",
    options: ["Menor repulsão eletrônica", "Mais elétrons no núcleo", "Maior número quântico", "Menor energia do 4s"],
    correct: 0,
    explanation: "Distribuição com spins paralelos reduz repulsão → <strong>maior estabilidade</strong>.",
    wrongExplanations: [
        "Número de elétrons no núcleo não muda.",
        "Número quântico não explica estabilidade aqui.",
        "Não depende apenas do 4s."]
},
{
    question: "Qual configuração representa uma exceção?",
    options: ["[Ar] 4s¹ 3d⁵", "[Ar] 4s² 3d⁴", "[Ar] 4s² 3d²", "[Ar] 4s² 3d³"],
    correct: 0,
    explanation: "<strong>4s¹ 3d⁵</strong> (Cromo) é exceção devido à estabilidade do d meio-cheio.",
    wrongExplanations: [
        "Distribuição prevista pela regra padrão.",
        "Distribuição comum, sem exceção.",
        "Distribuição comum, sem exceção."]
},
{
    question: "Qual configuração é mais estável?",
    options: ["4s² 3d⁴", "4s¹ 3d⁵", "4s² 3d³", "4s¹ 3d⁴"],
    correct: 1,
    explanation: "<strong>4s¹ 3d⁵</strong> tem subnível d meio-cheio → mais estável.",
    wrongExplanations: [
        "Menos estável que a configuração meio-cheia.",
        "Não apresenta estabilidade especial.",
        "Ainda não atinge meia ocupação."]
},
{
    question: "Qual é a vantagem do subnível d completo?",
    options: ["Maior simetria eletrônica", "Mais elétrons livres", "Menor número de orbitais", "Maior valor de n"],
    correct: 0,
    explanation: "Subnível <strong>d¹⁰ completo</strong> possui maior simetria e estabilidade.",
    wrongExplanations: [
        "Não significa elétrons livres.",
        "Número de orbitais não muda.",
        "n não determina essa estabilidade."]
},
{
    question: "Por que 4s perde elétrons antes de 3d em íons?",
    options: ["Fica mais energético após preenchimento", "Tem menor n", "Tem mais elétrons", "É mais interno"],
    correct: 0,
    explanation: "Após preenchido, o <strong>4s fica mais energético</strong> que 3d → sai primeiro.",
    wrongExplanations: [
        "n não explica esse comportamento.",
        "Quantidade de elétrons não define isso.",
        "4s é mais externo, não interno."]
},
{
    question: "Qual configuração representa o Cu²⁺?",
    options: ["[Ar] 3d⁹", "[Ar] 4s¹ 3d⁸", "[Ar] 4s² 3d⁷", "[Ar] 3d¹⁰"],
    correct: 0,
    explanation: "Cu: [Ar] 4s¹ 3d¹⁰ → perde 4s e 1 do 3d → <strong>3d⁹</strong>.",
    wrongExplanations: [
        "4s já foi removido primeiro.",
        "Número de elétrons incorreto.",
        "Não perdeu elétrons suficientes."]
}
            ],
            

        };
    }
}

// Inicialização
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new OrbitaisQuest();
});