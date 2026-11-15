(() => {
  const $ = id => document.getElementById(id);
  const loginPanel = $("loginPanel"), dashboard = $("dashboard"), loginButton = $("loginButton");
  let activeUser = null;
  const number = value => Number(value || 0).toLocaleString("pt-BR");

  function readProfiles() {
    const saves = missaoAtomoGetSaves();
    return [1,2,3].map(i => {
      const slot = saves[`slot${i}`] || {};
      const a = slot.blocoA || null, b = slot.blocoB || null;
      return { name: `Perfil ${i}`, a, b, total: (a?.points || 0) + (b?.score || 0), streak: Math.max(a?.streak || 0, b?.streak || 0), world: b?.currentWorld || 1, active: !!(a || b) };
    });
  }
  function render() {
    const rows = readProfiles(), active = rows.filter(x => x.active);
    $("profilesCount").textContent = active.length;
    $("pointsTotal").textContent = number(rows.reduce((s, x) => s + Number(x.total || 0), 0));
    $("bestStreak").textContent = Math.max(0, ...rows.map(x => Number(x.streak) || 0));
    $("bestWorld").textContent = `${Math.max(1, ...rows.map(x => Number(x.world) || 1))}/5`;

    // Os dados de progresso vêm do armazenamento local e não são confiáveis.
    // Criar os elementos e preencher textContent evita interpretar esses dados como HTML.
    const tableBody = $("profilesTable");
    const fragment = document.createDocumentFragment();

    function addCell(row, value, emphasize = false) {
      const cell = document.createElement("td");
      if (emphasize) {
        const strong = document.createElement("strong");
        strong.textContent = String(value);
        cell.appendChild(strong);
      } else {
        cell.textContent = String(value);
      }
      row.appendChild(cell);
    }

    rows.forEach(profile => {
      const row = document.createElement("tr");
      addCell(row, profile.name, true);
      addCell(row, profile.a
        ? `${number(profile.a.points)} pts · sequência ${Number(profile.a.streak) || 0}`
        : "—");
      addCell(row, profile.b
        ? `${number(profile.b.score)} pts · mundo ${Number(profile.b.currentWorld) || 1}`
        : "—");
      addCell(row, `${number(profile.total)} pts`, true);
      fragment.appendChild(row);
    });

    tableBody.replaceChildren(fragment);
    $("emptyState").hidden = active.length > 0;
  }
  function showDashboard(user) {
    activeUser = user; loginPanel.hidden = true; dashboard.hidden = false;
    $("teacherName").textContent = user.name || user.login;
    $("avatar").src = user.avatar_url; $("githubLogin").textContent = `Conectado como @${user.login}`;
    render();
  }
  async function init() {
    const user = await MissaoAuth.currentUser();
    if (user) showDashboard(user);
  }
  loginButton.addEventListener("click", async () => {
    loginButton.disabled = true; loginButton.textContent = "Redirecionando ao GitHub…";
    $("deviceInstructions").hidden = false; $("loginStatus").textContent = "Abrindo autorização segura do GitHub…";
    try { await MissaoAuth.login(); }
    catch (error) { $("loginStatus").textContent = error.message; }
    finally { loginButton.disabled = false; loginButton.textContent = "Entrar com GitHub"; }
  });
  $("refreshButton").addEventListener("click", render);
  $("logoutButton").addEventListener("click", async () => { await MissaoAuth.logout(); location.reload(); });
  $("exportButton").addEventListener("click", () => {
    const rows = readProfiles();
    const csv = [ ["Perfil","Quiz Bloco A (pontos)","Orbitais Quest (pontos)","Mundo","Melhor sequência","Total"], ...rows.map(x => [x.name,x.a?.points || 0,x.b?.score || 0,x.world,x.streak,x.total]) ]
      .map(row => row.map(value => `"${String(value).replace(/"/g,'""')}"`).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], {type:"text/csv;charset=utf-8;"});
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "relatorio-missao-atomo.csv"; link.click(); URL.revokeObjectURL(link.href);
  });
  init().catch(error => { $("loginStatus").textContent = error.message; });
})();
