/**
 * TradeQuest — Controlador de interfaz
 * Conecta el motor del juego (game.js) y la tabla de posiciones (leaderboard.js)
 * con las pantallas y botones definidos en index.html.
 */

(function () {
  const game = new TradeQuestGame(QUESTIONS);
  let soundOn = true;
  let audioCtx = null;

  // ---------- Utilidades de sonido (sin archivos externos) ----------
  function beep(freq, duration, type = "sine") {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) { /* audio no disponible, seguimos sin sonido */ }
  }
  const sfx = {
    correct: () => beep(880, 0.18, "triangle"),
    incorrect: () => beep(160, 0.25, "sawtooth"),
    tick: () => beep(1200, 0.05, "square"),
    start: () => beep(660, 0.15, "sine")
  };

  // ---------- Navegación entre pantallas ----------
  const screens = {
    menu: document.getElementById("screen-menu"),
    rules: document.getElementById("screen-rules"),
    game: document.getElementById("screen-game"),
    result: document.getElementById("screen-result"),
    leaderboard: document.getElementById("screen-leaderboard")
  };
  function showScreen(name) {
    Object.values(screens).forEach((el) => el.classList.remove("active"));
    screens[name].classList.add("active");
  }

  document.getElementById("question-count-footer").textContent = QUESTIONS.length;

  // ---------- Menú ----------
  document.getElementById("btn-start").addEventListener("click", () => {
    const name = document.getElementById("input-name").value;
    const mode = document.querySelector('input[name="mode"]:checked').value;
    sfx.start();
    game.start(name, mode);
    beginQuestion();
    showScreen("game");
  });

  document.getElementById("btn-view-rules").addEventListener("click", () => showScreen("rules"));
  document.getElementById("btn-rules-back").addEventListener("click", () => showScreen("menu"));
  document.getElementById("btn-view-leaderboard").addEventListener("click", () => {
    renderLeaderboardTable(latestLeaderboardEntries);
    showScreen("leaderboard");
  });
  document.getElementById("btn-leaderboard-back").addEventListener("click", () => showScreen("menu"));

  document.getElementById("btn-mute").addEventListener("click", (e) => {
    soundOn = !soundOn;
    e.target.textContent = soundOn ? "🔊" : "🔇";
  });

  // ---------- Juego ----------
  const el = {
    progress: document.getElementById("hud-progress"),
    score: document.getElementById("hud-score"),
    streak: document.getElementById("hud-streak"),
    lives: document.getElementById("hud-lives"),
    timerBar: document.getElementById("timer-bar"),
    timerTrack: document.querySelector(".timer-track"),
    level: document.getElementById("question-level"),
    text: document.getElementById("question-text"),
    optionsGrid: document.getElementById("options-grid"),
    feedbackBox: document.getElementById("feedback-box"),
    feedbackTitle: document.getElementById("feedback-title"),
    feedbackExplanation: document.getElementById("feedback-explanation"),
    btnNext: document.getElementById("btn-next"),
    questionCard: document.querySelector(".question-card")
  };

  game.onTick = (secondsLeft, totalSeconds) => {
    const pct = Math.max(0, (secondsLeft / totalSeconds) * 100);
    el.timerBar.style.width = pct + "%";
    el.timerBar.classList.toggle("warn", pct < 25);
    if (Math.ceil(secondsLeft) !== Math.ceil(secondsLeft + 0.1) && secondsLeft <= 5 && secondsLeft > 0) {
      sfx.tick();
    }
  };
  game.onTimeUp = () => handleAnswer(null);

  function beginQuestion() {
    const q = game.nextQuestion();
    if (!q) return finishGame();

    el.progress.textContent = `Pregunta ${game.currentIndex + 1}/${game.totalQuestions}`;
    el.score.textContent = `⭐ ${game.score} pts`;
    el.streak.textContent = `🔥 Racha: ${game.streak}`;
    el.lives.textContent = game.mode === "competencia" ? "❤️".repeat(game.lives) || "💀" : "📖 Estudio";
    el.timerTrack.style.display = game.mode === "competencia" ? "block" : "none";

    el.level.textContent = q.level;
    el.text.textContent = q.text;
    el.feedbackBox.hidden = true;
    el.questionCard.classList.remove("shake", "pop");

    el.optionsGrid.innerHTML = "";
    el.optionsGrid.classList.toggle("two-col", q.type === "tf");
    q.shuffledOptions.forEach((optionText, idx) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = optionText;
      btn.addEventListener("click", () => handleAnswer(idx));
      el.optionsGrid.appendChild(btn);
    });

    game.startTimer();
  }

  function handleAnswer(selectedIndex) {
    const result = game.submitAnswer(selectedIndex);
    const buttons = Array.from(el.optionsGrid.querySelectorAll(".option-btn"));
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === result.correctIndex) btn.classList.add("correct");
      else if (idx === selectedIndex) btn.classList.add("incorrect");
    });

    el.score.textContent = `⭐ ${game.score} pts`;
    el.streak.textContent = `🔥 Racha: ${game.streak}`;
    el.lives.textContent = game.mode === "competencia" ? "❤️".repeat(game.lives) || "💀" : "📖 Estudio";

    if (result.isCorrect) {
      sfx.correct();
      el.questionCard.classList.add("pop");
      el.feedbackTitle.textContent = `✅ ¡Correcto! +${result.pointsEarned} pts`;
    } else {
      sfx.incorrect();
      el.questionCard.classList.add("shake");
      el.feedbackTitle.textContent = selectedIndex === null ? "⏰ ¡Se acabó el tiempo!" : "❌ Incorrecto";
    }
    el.feedbackExplanation.textContent = game.currentQuestion().explanation;
    el.feedbackBox.hidden = false;
    el.btnNext.focus();

    if (game.isGameOver) {
      el.btnNext.textContent = "Ver resultados →";
    } else {
      el.btnNext.textContent = "Siguiente pregunta →";
    }
  }

  el.btnNext.addEventListener("click", () => {
    if (game.isGameOver || game.currentIndex >= game.totalQuestions - 1) {
      finishGame();
    } else {
      beginQuestion();
    }
  });

  // ---------- Resultados ----------
  let lastSummary = null;

  async function finishGame() {
    game.stopTimer();
    lastSummary = game.getSummary();

    document.getElementById("result-title").textContent =
      game.mode === "estudio" ? "¡Repaso completado!" : (game.isGameOver ? "¡Juego terminado — sin vidas!" : "¡Juego completado!");
    document.getElementById("result-score").textContent = `${lastSummary.score} pts`;
    document.getElementById("result-correct").textContent = `${lastSummary.correctCount}/${lastSummary.answeredCount}`;
    document.getElementById("result-accuracy").textContent = `${lastSummary.accuracy}%`;
    document.getElementById("result-best-streak").textContent = lastSummary.bestStreak;

    let message = "";
    if (lastSummary.mode === "estudio") {
      message = "Modo estudio: este resultado no se guarda en la tabla de posiciones. ¡Ahora inténtalo en modo Competencia!";
    } else if (lastSummary.accuracy >= 85) {
      message = "¡Dominas las teorías modernas del comercio internacional! 🎓";
    } else if (lastSummary.accuracy >= 60) {
      message = "Buen trabajo. Repasa las explicaciones de lo que falló antes del examen.";
    } else {
      message = "Vas por buen camino. Prueba el modo Estudio para repasar con calma.";
    }
    document.getElementById("result-message").textContent = message;

    if (lastSummary.mode === "competencia") {
      try {
        const updated = await submitScore(lastSummary);
        // En modo local no hay "push" en vivo: refrescamos aquí la copia en memoria
        // para que la tabla de posiciones ya salga al día la próxima vez que se abra.
        if (updated) latestLeaderboardEntries = updated;
      } catch (e) {
        console.warn("No se pudo enviar el puntaje:", e);
      }
    }

    showScreen("result");
  }

  document.getElementById("btn-play-again").addEventListener("click", () => showScreen("menu"));
  document.getElementById("btn-go-leaderboard").addEventListener("click", () => {
    renderLeaderboardTable(latestLeaderboardEntries);
    showScreen("leaderboard");
  });
  document.getElementById("btn-download-result").addEventListener("click", () => {
    if (!lastSummary) return;
    const safeName = lastSummary.playerName.replace(/[^a-z0-9áéíóúñ]+/gi, "_");
    downloadJSON(`tradequest_${safeName}_${Date.now()}.json`, [lastSummary]);
  });

  // ---------- Tabla de posiciones ----------
  let latestLeaderboardEntries = [];
  const statusBadge = document.getElementById("leaderboard-status");
  const leaderboardSubtitle = document.getElementById("leaderboard-subtitle");

  function updateStatusBadge(meta) {
    statusBadge.classList.remove("is-remote", "is-local");
    if (meta.remote) {
      statusBadge.textContent = "🌐 Tabla global en vivo";
      statusBadge.classList.add("is-remote");
      leaderboardSubtitle.textContent = "Esta tabla se actualiza sola apenas cualquier estudiante del salón termina de jugar. Solo la persona docente puede reiniciarla.";
    } else {
      statusBadge.textContent = meta.error ? "⚠️ Sin conexión — tabla local" : "💾 Tabla local (solo este navegador)";
      statusBadge.classList.add("is-local");
      leaderboardSubtitle.textContent = "Los resultados se guardan en este navegador. Para una tabla de todo el salón que se actualice sola, configura Firebase (ver README.md → \"Tabla de posiciones global\").";
    }
  }

  // Se conecta una sola vez al cargar la página; a partir de aquí, cada
  // cambio (de cualquier estudiante, en cualquier dispositivo, si el modo
  // global está activo) llega solo, sin recargar la página.
  subscribeToLeaderboard((entries, meta) => {
    latestLeaderboardEntries = entries;
    updateStatusBadge(meta);
    if (screens.leaderboard.classList.contains("active")) {
      renderLeaderboardTable(entries);
    }
  });

  function renderLeaderboardTable(entries) {
    const tbody = document.getElementById("leaderboard-body");
    const empty = document.getElementById("leaderboard-empty");
    tbody.innerHTML = "";

    if (!entries || entries.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    entries.forEach((entry, i) => {
      const tr = document.createElement("tr");
      const date = entry.date ? new Date(entry.date).toLocaleDateString() : "—";
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${escapeHTML(entry.playerName)}</td>
        <td>${entry.score}</td>
        <td>${entry.accuracy}%</td>
        <td>${date}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  document.getElementById("btn-export-leaderboard").addEventListener("click", () => {
    downloadJSON(`tradequest_tabla_${Date.now()}.json`, latestLeaderboardEntries);
  });

  // ---- Reinicio de la tabla: local (confirm simple) o global (login docente) ----
  const teacherModal = document.getElementById("modal-teacher-login");
  const teacherEmailInput = document.getElementById("teacher-email");
  const teacherPasswordInput = document.getElementById("teacher-password");
  const teacherLoginError = document.getElementById("teacher-login-error");
  const btnTeacherConfirm = document.getElementById("btn-teacher-confirm");

  document.getElementById("btn-reset-leaderboard").addEventListener("click", () => {
    if (isRemoteMode()) {
      teacherEmailInput.value = "";
      teacherPasswordInput.value = "";
      teacherLoginError.hidden = true;
      teacherModal.hidden = false;
      teacherEmailInput.focus();
    } else if (confirm("¿Seguro que deseas borrar toda la tabla de posiciones de este navegador? Esta acción no se puede deshacer.")) {
      resetLeaderboard().then(() => {
        latestLeaderboardEntries = [];
        renderLeaderboardTable(latestLeaderboardEntries);
      });
    }
  });

  document.getElementById("btn-teacher-cancel").addEventListener("click", () => {
    teacherModal.hidden = true;
  });

  btnTeacherConfirm.addEventListener("click", async () => {
    const email = teacherEmailInput.value.trim();
    const password = teacherPasswordInput.value;
    btnTeacherConfirm.disabled = true;
    btnTeacherConfirm.textContent = "Verificando…";
    const result = await resetLeaderboard({ email, password });
    btnTeacherConfirm.disabled = false;
    btnTeacherConfirm.textContent = "Confirmar reinicio";

    if (result.ok) {
      teacherModal.hidden = true;
    } else {
      teacherLoginError.textContent = result.message;
      teacherLoginError.hidden = false;
    }
  });

  document.getElementById("input-import").addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    let pending = files.length;
    let combined = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          const entries = Array.isArray(parsed) ? parsed : [parsed];
          combined = combined.concat(entries);
        } catch (err) {
          console.warn(`No se pudo leer ${file.name}:`, err);
        } finally {
          pending--;
          if (pending === 0) {
            const merged = importEntries(combined);
            if (isRemoteMode()) {
              alert("Nota: la tabla global ya se actualiza sola con Firebase. Este archivo se guardó como respaldo local, pero no se agregó a la tabla global.");
            } else {
              latestLeaderboardEntries = merged;
              renderLeaderboardTable(latestLeaderboardEntries);
            }
            e.target.value = "";
          }
        }
      };
      reader.readAsText(file);
    });
  });
})();
