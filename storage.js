/* =========================================================
   MISSAO ATOMO - ARMAZENAMENTO COMPARTILHADO (storage.js)
   =========================================================
   Um unico modelo de dados, com 3 "slots" de progresso, usado
   tanto pelo Bloco A (Quiz: Distribuicao Eletronica) quanto pelo
   Bloco B (Orbitais Quest). Antes, cada bloco salvava de um jeito
   diferente:
     - Bloco A: duas chaves globais simples, sem conceito de slot
       ('missaoAtomo_blocoA_points', 'missaoAtomo_blocoA_streak').
     - Bloco B: 3 slots nomeados, dentro de uma unica chave JSON
       ('orbitaisQuestSaves').
   Isso fazia o painel do menu combinar dados de naturezas
   diferentes (um total fixo + o "melhor slot" do outro), o que e
   inconsistente. Este arquivo unifica os dois sob a mesma chave e
   a mesma estrutura de slots, e faz a migracao automatica (uma
   unica vez) dos dados antigos, para ninguem perder progresso.

   Estrutura salva em localStorage['missaoAtomoSaves']:
   {
     slot1: { blocoA: {points, streak} | null,
              blocoB: {score, currentWorld, streak, worldStats, answeredQuestions} | null },
     slot2: { ... },
     slot3: { ... }
   }
   --------------------------------------------------------- */

const MISSAO_ATOMO_SAVES_KEY = "missaoAtomoSaves";
const LEGACY_BLOCO_B_KEY = "orbitaisQuestSaves";
const LEGACY_BLOCO_A_POINTS_KEY = "missaoAtomo_blocoA_points";
const LEGACY_BLOCO_A_STREAK_KEY = "missaoAtomo_blocoA_streak";

function missaoAtomoEmptySlot() {
    return { blocoA: null, blocoB: null };
}

function missaoAtomoEmptySaves() {
    return { slot1: missaoAtomoEmptySlot(), slot2: missaoAtomoEmptySlot(), slot3: missaoAtomoEmptySlot() };
}

// Migra dados salvos no formato antigo (se existirem) para a nova estrutura
// unificada. So roda se 'missaoAtomoSaves' ainda nao existir, e nunca apaga
// as chaves antigas (mantidas apenas como historico/seguranca, sem uso).
function missaoAtomoMigrateLegacyData() {
    const saves = missaoAtomoEmptySaves();
    let migrated = false;

    try {
        const legacyBRaw = localStorage.getItem(LEGACY_BLOCO_B_KEY);
        if (legacyBRaw) {
            const legacyB = JSON.parse(legacyBRaw);
            ["slot1", "slot2", "slot3"].forEach(key => {
                if (legacyB[key]) {
                    saves[key].blocoB = legacyB[key];
                    migrated = true;
                }
            });
        }
    } catch (e) {
        console.warn("Não foi possível migrar o progresso antigo do Orbitais Quest.", e);
    }

    try {
        const legacyPoints = parseInt(localStorage.getItem(LEGACY_BLOCO_A_POINTS_KEY), 10);
        const legacyStreak = parseInt(localStorage.getItem(LEGACY_BLOCO_A_STREAK_KEY), 10);
        if (!isNaN(legacyPoints) && legacyPoints > 0) {
            // Nao havia conceito de slot no Bloco A antigo; o progresso
            // existente vira o do slot 1 por padrao.
            saves.slot1.blocoA = { points: legacyPoints, streak: isNaN(legacyStreak) ? 0 : legacyStreak };
            migrated = true;
        }
    } catch (e) {
        console.warn("Não foi possível migrar o progresso antigo do Quiz de Distribuição Eletrônica.", e);
    }

    if (migrated) {
        localStorage.setItem(MISSAO_ATOMO_SAVES_KEY, JSON.stringify(saves));
    }
    return saves;
}

function missaoAtomoGetSaves() {
    const raw = localStorage.getItem(MISSAO_ATOMO_SAVES_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            return Object.assign(missaoAtomoEmptySaves(), parsed);
        } catch (e) {
            console.warn("Progresso salvo corrompido, iniciando um novo.", e);
            return missaoAtomoEmptySaves();
        }
    }
    return missaoAtomoMigrateLegacyData();
}

function missaoAtomoWriteSaves(saves) {
    localStorage.setItem(MISSAO_ATOMO_SAVES_KEY, JSON.stringify(saves));
}

function missaoAtomoGetSlot(slotNum) {
    const saves = missaoAtomoGetSaves();
    return saves["slot" + slotNum] || missaoAtomoEmptySlot();
}

function missaoAtomoSaveBlocoA(slotNum, data) {
    const saves = missaoAtomoGetSaves();
    if (!saves["slot" + slotNum]) saves["slot" + slotNum] = missaoAtomoEmptySlot();
    saves["slot" + slotNum].blocoA = data;
    missaoAtomoWriteSaves(saves);
}

function missaoAtomoSaveBlocoB(slotNum, data) {
    const saves = missaoAtomoGetSaves();
    if (!saves["slot" + slotNum]) saves["slot" + slotNum] = missaoAtomoEmptySlot();
    saves["slot" + slotNum].blocoB = data;
    missaoAtomoWriteSaves(saves);
}

// Apaga o slot inteiro (progresso dos dois blocos), pois um slot representa
// um unico "perfil" de jogador.
function missaoAtomoDeleteSlot(slotNum) {
    const saves = missaoAtomoGetSaves();
    saves["slot" + slotNum] = missaoAtomoEmptySlot();
    missaoAtomoWriteSaves(saves);
}

// Progresso combinado para o painel do menu principal: soma os pontos dos
// dois blocos em todos os slots (total "vitalicio"), e usa o maior streak e
// o maior mundo alcancado entre todos os slots, para refletir o melhor
// desempenho do jogador em qualquer perfil salvo.
function missaoAtomoGetCombinedProgress() {
    const saves = missaoAtomoGetSaves();
    let totalPoints = 0, bestStreak = 0, bestWorld = 1;

    ["slot1", "slot2", "slot3"].forEach(key => {
        const slot = saves[key];
        if (!slot) return;
        if (slot.blocoA) {
            totalPoints += slot.blocoA.points || 0;
            if ((slot.blocoA.streak || 0) > bestStreak) bestStreak = slot.blocoA.streak;
        }
        if (slot.blocoB) {
            totalPoints += slot.blocoB.score || 0;
            if ((slot.blocoB.streak || 0) > bestStreak) bestStreak = slot.blocoB.streak;
            if ((slot.blocoB.currentWorld || 1) > bestWorld) bestWorld = slot.blocoB.currentWorld;
        }
    });

    return { totalPoints, streak: bestStreak, world: bestWorld };
}
