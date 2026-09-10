/**
 * TradeQuest — Tabla de posiciones
 * ==================================
 * Tiene dos modos, y el juego elige uno automáticamente según
 * js/firebase-config.js:
 *
 *  · MODO LOCAL (por defecto, sin configurar nada):
 *    los puntajes se guardan en localStorage, solo en ese navegador.
 *    El reinicio es un simple confirm() en el propio dispositivo.
 *
 *  · MODO GLOBAL (si configuraste Firebase en js/firebase-config.js):
 *    los puntajes se guardan en Firestore y la tabla se actualiza SOLA
 *    en tiempo real en todas las pantallas conectadas (proyector,
 *    celulares de estudiantes, etc.) apenas alguien termina de jugar.
 *    Reiniciar la tabla exige iniciar sesión con el correo/contraseña
 *    de la persona docente (Firebase Authentication) — cualquier otra
 *    persona que lo intente es rechazada por las reglas de seguridad
 *    de Firestore, no solo por la interfaz.
 *
 * main.js solo usa las funciones exportadas al final de este archivo,
 * sin preocuparse de en qué modo está funcionando.
 */

const LOCAL_LEADERBOARD_KEY = "tradequest_leaderboard_v1";
const LEADERBOARD_MAX_ENTRIES = 100;
const SCORES_COLLECTION = "scores";

let firebaseApp = null;
let firestoreDb = null;
let firebaseAuth = null;
let firebaseReadyPromise = null;

/* ---------------------------------------------------------------------
 * Carga perezosa del SDK de Firebase (solo si FIREBASE_ENABLED es true)
 * ------------------------------------------------------------------- */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(s);
  });
}

function ensureFirebaseReady() {
  if (!FIREBASE_ENABLED) return Promise.resolve(false);
  if (firebaseReadyPromise) return firebaseReadyPromise;

  const SDK_VERSION = "10.13.2";
  firebaseReadyPromise = loadScript(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app-compat.js`)
    .then(() => Promise.all([
      loadScript(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore-compat.js`),
      loadScript(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth-compat.js`)
    ]))
    .then(() => {
      firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
      firestoreDb = firebase.firestore();
      firebaseAuth = firebase.auth();
      return true;
    })
    .catch((err) => {
      console.warn("No se pudo conectar con la tabla global (Firebase). Se usará la tabla local.", err);
      firebaseReadyPromise = null;
      return false;
    });

  return firebaseReadyPromise;
}

function isRemoteMode() {
  return FIREBASE_ENABLED;
}

/* ---------------------------------------------------------------------
 * MODO LOCAL — localStorage
 * ------------------------------------------------------------------- */
function getLocalLeaderboard() {
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveLocalLeaderboard(entries) {
  try {
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (e) { /* almacenamiento no disponible: seguimos sin guardar */ }
}

function addLocalScore(entry) {
  const entries = getLocalLeaderboard();
  entries.push(entry);
  entries.sort((a, b) => b.score - a.score);
  const trimmed = entries.slice(0, LEADERBOARD_MAX_ENTRIES);
  saveLocalLeaderboard(trimmed);
  return trimmed;
}

function importEntries(newEntries) {
  const current = getLocalLeaderboard();
  const seen = new Set(current.map((e) => `${e.playerName}|${e.score}|${e.date}`));
  newEntries.forEach((e) => {
    if (!e || typeof e.playerName !== "string" || typeof e.score !== "number") return;
    const key = `${e.playerName}|${e.score}|${e.date}`;
    if (seen.has(key)) return;
    seen.add(key);
    current.push(e);
  });
  current.sort((a, b) => b.score - a.score);
  const trimmed = current.slice(0, LEADERBOARD_MAX_ENTRIES);
  saveLocalLeaderboard(trimmed);
  return trimmed;
}

/* ---------------------------------------------------------------------
 * API PÚBLICA (usada por main.js)
 * ------------------------------------------------------------------- */

/**
 * Se suscribe a la tabla de posiciones. Llama a onUpdate(entries, meta)
 * inmediatamente y cada vez que cambie (en modo global, en tiempo real
 * para todas las personas conectadas; en modo local, solo en este
 * navegador). Devuelve una función para cancelar la suscripción.
 */
function subscribeToLeaderboard(onUpdate) {
  let unsubscribed = false;
  let unsubscribeFn = () => { unsubscribed = true; };

  ensureFirebaseReady().then((ready) => {
    if (unsubscribed) return;

    if (!ready) {
      onUpdate(getLocalLeaderboard(), { remote: false });
      return;
    }

    const query = firestoreDb.collection(SCORES_COLLECTION).orderBy("score", "desc").limit(LEADERBOARD_MAX_ENTRIES);
    const unsub = query.onSnapshot(
      (snapshot) => {
        const entries = snapshot.docs.map((doc) => doc.data());
        onUpdate(entries, { remote: true });
      },
      (err) => {
        console.warn("Se perdió la conexión con la tabla global; usando copia local.", err);
        onUpdate(getLocalLeaderboard(), { remote: false, error: true });
      }
    );
    unsubscribeFn = unsub;
  });

  return () => unsubscribeFn();
}

/** Envía un resultado de partida (solo si el modo de juego fue "competencia"). */
async function submitScore(entry) {
  if (!entry || entry.mode !== "competencia") return;

  const record = {
    playerName: entry.playerName,
    score: Math.round(entry.score),
    accuracy: entry.accuracy,
    correctCount: entry.correctCount,
    totalQuestions: entry.totalQuestions,
    bestStreak: entry.bestStreak,
    date: entry.date
  };

  const ready = await ensureFirebaseReady();
  if (!ready) {
    return addLocalScore(record); // local: no hay "push" en vivo, devolvemos la tabla ya actualizada
  }

  try {
    await firestoreDb.collection(SCORES_COLLECTION).add(record);
    return undefined; // remoto: el onSnapshot de subscribeToLeaderboard ya se encarga de avisar
  } catch (err) {
    console.warn("No se pudo enviar el puntaje a la tabla global; se guarda localmente.", err);
    return addLocalScore(record);
  }
}

/**
 * Reinicia la tabla.
 *  - Modo local: borra localStorage (ya se confirma en la interfaz antes de llamar esto).
 *  - Modo global: requiere credenciales de la persona docente. Devuelve
 *    { ok: true } o { ok: false, message } sin lanzar excepciones, para
 *    que main.js pueda mostrar el error en el propio formulario.
 */
async function resetLeaderboard(credentials) {
  const ready = await ensureFirebaseReady();

  if (!ready) {
    saveLocalLeaderboard([]);
    return { ok: true };
  }

  const { email, password } = credentials || {};
  if (!email || !password) {
    return { ok: false, message: "Ingresa el correo y la contraseña de la persona docente." };
  }

  try {
    await firebaseAuth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    return { ok: false, message: "Credenciales incorrectas. Solo la cuenta docente puede reiniciar la tabla." };
  }

  try {
    const snapshot = await firestoreDb.collection(SCORES_COLLECTION).get();
    const batchSize = 400; // límite seguro por lote de Firestore (máx. 500)
    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = firestoreDb.batch();
      docs.slice(i, i + batchSize).forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, message: "Se inició sesión, pero Firestore rechazó el borrado. Revisa las reglas de seguridad (ver README)." };
  } finally {
    firebaseAuth.signOut().catch(() => {});
  }
}

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

if (typeof module !== "undefined") {
  module.exports = { subscribeToLeaderboard, submitScore, resetLeaderboard, importEntries, downloadJSON, isRemoteMode };
}
