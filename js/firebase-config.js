/**
 * TradeQuest — Configuración de la tabla de posiciones GLOBAL
 * =============================================================
 *
 * Por defecto, TradeQuest guarda los puntajes solo en el navegador de
 * cada estudiante (modo local). Si quieres UNA tabla compartida que se
 * actualice sola conforme cada estudiante termina de jugar —sin importar
 * en qué computadora o celular esté—, necesitas conectar una base de
 * datos gratuita: Firebase Firestore (de Google).
 *
 * Sigue la guía "Tabla de posiciones global (Firebase)" del README.md.
 * Son ~10-15 minutos, una sola vez, y no requiere tarjeta de crédito
 * (plan gratuito "Spark").
 *
 * Cuando termines de crear tu proyecto de Firebase, copia el objeto
 * "firebaseConfig" que Firebase te entrega y pégalo abajo, reemplazando
 * los valores vacíos. Mientras "apiKey" y "projectId" estén vacíos, el
 * juego sigue funcionando normalmente, pero con tabla LOCAL (por
 * navegador) en vez de global.
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAhy2pJ-O2DzIUqrXZo7d3_Wy2GyWp3g8I",
  authDomain: "xp0201-s3-tradequest-fd9d0.firebaseapp.com",
  projectId: "xp0201-s3-tradequest-fd9d0",
  storageBucket: "xp0201-s3-tradequest-fd9d0.firebasestorage.app",
  messagingSenderId: "1011729918443",
  appId: "1:1011729918443:web:d2c979b68af8862259d1ae"
};

// Correo de la persona docente autorizada a reiniciar la tabla global.
// Debe coincidir EXACTAMENTE con el usuario que crees en
// Firebase → Authentication → Users, y con la regla de seguridad de
// Firestore (ver README). Cámbialo si usas otro correo para administrar.
const TEACHER_EMAIL = "laura.sariego@ucr.ac.cr";

// No toques esta línea: detecta automáticamente si ya configuraste Firebase.
const FIREBASE_ENABLED = Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
