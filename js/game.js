/**
 * TradeQuest — Motor del juego
 * Toda la lógica de puntaje, tiempo, vidas y avance de preguntas vive aquí.
 * main.js se encarga de conectar esto con los botones y pantallas del HTML.
 */

const LEVEL_POINTS = {
  Recordar: 100,
  Comprender: 150,
  Aplicar: 200,
  Analizar: 250
};

const LEVEL_TIME_SECONDS = {
  Recordar: 20,
  Comprender: 20,
  Aplicar: 25,
  Analizar: 30
};

const STUDY_TIME_SECONDS = 999; // "sin límite" práctico en modo Estudio
const STARTING_LIVES = 3;

function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Prepara una pregunta para jugarse: mezcla las opciones (si es mc)
 * y guarda cuál es la respuesta correcta tras la mezcla.
 */
function prepareQuestion(question) {
  if (question.type === "tf") {
    return {
      ...question,
      shuffledOptions: ["Verdadero", "Falso"],
      shuffledCorrectIndex: question.correctIndex
    };
  }
  const indices = shuffleArray(question.options.map((_, i) => i));
  const shuffledOptions = indices.map((i) => question.options[i]);
  const shuffledCorrectIndex = indices.indexOf(question.correctIndex);
  return { ...question, shuffledOptions, shuffledCorrectIndex };
}

class TradeQuestGame {
  constructor(questions) {
    this.allQuestions = questions;
    this.onTick = null;       // (secondsLeft, totalSeconds) => void
    this.onTimeUp = null;     // () => void
    this.reset();
  }

  reset() {
    this.playerName = "";
    this.mode = "competencia";
    this.order = [];
    this.currentIndex = -1;
    this.score = 0;
    this.lives = STARTING_LIVES;
    this.streak = 0;
    this.bestStreak = 0;
    this.correctCount = 0;
    this.answeredCount = 0;
    this._timerId = null;
    this._secondsLeft = 0;
    this._totalSeconds = 0;
    this._answered = false;
  }

  start(playerName, mode) {
    this.reset();
    this.playerName = (playerName || "Jugador anónimo").trim().slice(0, 24) || "Jugador anónimo";
    this.mode = mode === "estudio" ? "estudio" : "competencia";
    this.order = shuffleArray(this.allQuestions).map(prepareQuestion);
  }

  get totalQuestions() {
    return this.order.length;
  }

  get isGameOver() {
    return this.mode === "competencia" && this.lives <= 0;
  }

  get isFinished() {
    return this.currentIndex >= this.totalQuestions - 1 && this._answered;
  }

  currentQuestion() {
    return this.order[this.currentIndex];
  }

  /** Avanza a la siguiente pregunta. Devuelve la pregunta o null si ya no hay más. */
  nextQuestion() {
    this.currentIndex++;
    this._answered = false;
    if (this.currentIndex >= this.totalQuestions) return null;
    return this.currentQuestion();
  }

  startTimer() {
    this.stopTimer();
    const q = this.currentQuestion();
    const seconds = this.mode === "estudio" ? STUDY_TIME_SECONDS : LEVEL_TIME_SECONDS[q.level] || 20;
    this._secondsLeft = seconds;
    this._totalSeconds = seconds;

    if (this.mode === "estudio") return; // sin cuenta regresiva visible en modo estudio

    this._timerId = setInterval(() => {
      this._secondsLeft -= 0.1;
      if (this._secondsLeft <= 0) {
        this._secondsLeft = 0;
        this.stopTimer();
        if (this.onTick) this.onTick(this._secondsLeft, this._totalSeconds);
        if (!this._answered && this.onTimeUp) this.onTimeUp();
        return;
      }
      if (this.onTick) this.onTick(this._secondsLeft, this._totalSeconds);
    }, 100);
  }

  stopTimer() {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  }

  /**
   * Registra la respuesta del jugador.
   * @param {number|null} selectedIndex - índice elegido, o null si se acabó el tiempo.
   * @returns {{isCorrect: boolean, pointsEarned: number, correctIndex: number}}
   */
  submitAnswer(selectedIndex) {
    this.stopTimer();
    this._answered = true;
    this.answeredCount++;

    const q = this.currentQuestion();
    const isCorrect = selectedIndex !== null && selectedIndex === q.shuffledCorrectIndex;
    let pointsEarned = 0;

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      this.bestStreak = Math.max(this.bestStreak, this.streak);

      const base = LEVEL_POINTS[q.level] || 100;
      let timeFactor = 1;
      if (this.mode === "competencia" && this._totalSeconds > 0) {
        const ratio = Math.max(0, this._secondsLeft) / this._totalSeconds;
        timeFactor = 1 + 0.5 * ratio; // hasta +50% por velocidad
      }
      let comboFactor = 1;
      if (this.streak >= 6) comboFactor = 1.5;
      else if (this.streak >= 3) comboFactor = 1.2;

      pointsEarned = Math.round(base * timeFactor * comboFactor);
      this.score += pointsEarned;
    } else {
      this.streak = 0;
      if (this.mode === "competencia") this.lives = Math.max(0, this.lives - 1);
    }

    return { isCorrect, pointsEarned, correctIndex: q.shuffledCorrectIndex };
  }

  getSummary() {
    const accuracy = this.answeredCount > 0 ? Math.round((this.correctCount / this.answeredCount) * 100) : 0;
    return {
      playerName: this.playerName,
      mode: this.mode,
      score: this.score,
      correctCount: this.correctCount,
      answeredCount: this.answeredCount,
      totalQuestions: this.totalQuestions,
      accuracy,
      bestStreak: this.bestStreak,
      date: new Date().toISOString()
    };
  }
}

if (typeof module !== "undefined") module.exports = { TradeQuestGame, LEVEL_POINTS, LEVEL_TIME_SECONDS };
