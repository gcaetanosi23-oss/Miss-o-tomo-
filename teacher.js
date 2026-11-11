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
    $("pointsTotal").textContent = number(rows.reduce((s,x) => s + x.total, 0));
    $("bestStreak").textContent = Math.max(0,...rows.map(x => x.streak));
    $("bestWorld").textContent = `${Math.max(1,...rows.map(x => x.world))}/5`;
    $("profilesTable").innerHTML = rows.map(x => `<tr><td><strong>${x.name}</strong></td><td>${x.a ? `${number(x.a.points)} pts · sequência ${x.a.streak || 0}` : "—"}</td><td>${x.b ? `${number(x.b.score)} pts · mundo ${x.b.currentWorld || 1}` : "—"}</td><td><strong>${number(x.total)} pts</strong></td></tr>`).join("");
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
  $("logoutButton").addEventListener("click", () => { MissaoAuth.logout(); location.reload(); });
  $("exportButton").addEventListener("click", () => {
    const rows = readProfiles();
    const csv = [ ["Perfil","Quiz Bloco A (pontos)","Orbitais Quest (pontos)","Mundo","Melhor sequência","Total"], ...rows.map(x => [x.name,x.a?.points || 0,x.b?.score || 0,x.world,x.streak,x.total]) ]
      .map(row => row.map(value => `"${String(value).replace(/"/g,'""')}"`).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], {type:"text/csv;charset=utf-8;"});
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "relatorio-missao-atomo.csv"; link.click(); URL.revokeObjectURL(link.href);
  });
  init().catch(error => { $("loginStatus").textContent = error.message; });
})();
