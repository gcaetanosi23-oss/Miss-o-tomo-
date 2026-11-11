
const achievementBtn = document.querySelector('.achievement-btn');

// --- Agrega o progresso dos dois jogos em um único painel ---
// (a logica de leitura/migracao mora em storage.js, compartilhado com os
// dois blocos, para que o mesmo modelo de dados por slots seja usado em
// toda a aplicacao)
function getCombinedProgress() {
  return missaoAtomoGetCombinedProgress();
}

function renderProgress() {
  const progress = getCombinedProgress();
  document.getElementById('points').innerText = progress.totalPoints;
  document.getElementById('streak').innerText = progress.streak;
  const worldEl = document.querySelector('.status-item:nth-child(2) p');
  if (worldEl) worldEl.innerText = `${progress.world} / 5`;
}

renderProgress();

// Atualiza os números sempre que o usuário volta para essa aba/página
window.addEventListener('pageshow', renderProgress);

if (achievementBtn) {
  achievementBtn.addEventListener('click', () => {
    const progress = getCombinedProgress();
    const conquistas = [];
    if (progress.totalPoints >= 100) conquistas.push('🥉 Primeiros 100 pontos');
    if (progress.totalPoints >= 500) conquistas.push('🥈 500 pontos alcançados');
    if (progress.totalPoints >= 1000) conquistas.push('🥇 1000 pontos alcançados');
    if (progress.streak >= 5) conquistas.push('🔥 Streak de 5 acertos seguidos');
    if (progress.world >= 3) conquistas.push('🌍 Chegou ao Mundo 3 do Orbitais Quest');
    if (progress.world >= 5) conquistas.push('⭐ Todos os mundos desbloqueados');

    const mensagem = conquistas.length
      ? 'Conquistas desbloqueadas:\n\n' + conquistas.join('\n')
      : 'Nenhuma conquista ainda. Jogue para desbloquear!';
    alert(mensagem);
  });
}
