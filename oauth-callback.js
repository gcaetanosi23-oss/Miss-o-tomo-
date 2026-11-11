(() => {
  const status = document.getElementById("callbackStatus");
  const back = document.getElementById("backLink");
  MissaoAuth.completeCallback()
    .then(() => { status.textContent = "Identidade confirmada. Abrindo o painel do professor…"; location.replace("teacher.html"); })
    .catch(error => { status.textContent = error.message || "Falha na autenticação."; back.hidden = false; });
})();
