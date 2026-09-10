# TradeQuest — Teorías modernas del comercio internacional

Juego educativo para que el estudiantado **compita, gane puntos y repase** los temas de la Semana 3 del curso de Economía Internacional: Teoría del Ciclo del Producto (Vernon), rezago de imitación (Posner), economías de escala, Heckscher-Ohlin y la Nueva Teoría del Comercio (Krugman).

Es un sitio **100% estático** (HTML + CSS + JavaScript puro, sin frameworks ni backend), así que se puede editar directamente en Visual Studio Code y publicar en minutos.

## Contenido del proyecto

```
trade-quest/
├── index.html               → estructura de la página y las pantallas del juego
├── css/styles.css           → toda la apariencia visual (colores, tarjetas, animaciones)
├── js/questions.js          → EL BANCO DE PREGUNTAS (edítalo para cambiar/agregar preguntas)
├── js/game.js               → reglas del juego: puntos, tiempo, vidas, racha
├── js/firebase-config.js    → credenciales para la tabla de posiciones GLOBAL (opcional)
├── js/leaderboard.js        → tabla de posiciones (modo local o modo global en tiempo real)
├── js/main.js               → conecta todo con los botones y pantallas
├── package.json             → scripts opcionales para probar/publicar desde la terminal
└── README.md                → este archivo
```

## Cómo se juega

1. La persona estudiante escribe su nombre y elige modo **Competencia** (con tiempo, vidas y puntaje que entra a la tabla de posiciones) o **Estudio** (sin tiempo, para repasar con calma).
2. Se presentan las 19 preguntas del banco (14 de selección única + 5 de verdadero/falso) en orden aleatorio, con las opciones también mezcladas.
3. El puntaje por pregunta depende de:
   - **Nivel cognitivo**: Recordar (100 pts) · Comprender (150) · Aplicar (200) · Analizar (250).
   - **Velocidad**: responder rápido da hasta +50% de bono.
   - **Racha (combo)**: 3 aciertos seguidos = ×1.2, 6 o más = ×1.5.
4. En modo Competencia hay 3 vidas: una respuesta incorrecta o el tiempo agotado quita una vida.
5. Después de cada pregunta se muestra la respuesta correcta y una breve explicación (esto es lo que hace que el juego también sirva para **aprender**, no solo competir).
6. Al terminar, el resultado se guarda en la tabla de posiciones y se puede descargar como archivo `.json`. Por defecto la tabla es **local** (solo en ese navegador); si configuras Firebase (ver más abajo) pasa a ser **global y en vivo**: se actualiza sola en todas las pantallas conectadas apenas cualquier estudiante termina de jugar.

## Editar las preguntas

Abre `js/questions.js` en VS Code. Cada pregunta sigue este formato:

```js
{
  type: "mc",              // "mc" (selección única) o "tf" (verdadero/falso)
  level: "Comprender",     // Recordar | Comprender | Aplicar | Analizar
  text: "Enunciado...",
  options: ["A", "B", "C", "D"],
  correctIndex: 1,         // índice de la opción correcta (0 = primera)
  explanation: "Retroalimentación que ve el estudiante."
}
```

Puedes agregar, quitar o modificar preguntas libremente: el juego las toma todas automáticamente y las mezcla en cada partida.

## Probarlo localmente en VS Code

**Opción rápida (recomendada): extensión Live Server**
1. Instala la extensión **Live Server** (Ritwick Dey) desde el panel de extensiones de VS Code.
2. Clic derecho sobre `index.html` → **"Open with Live Server"**.
3. Se abrirá el juego en tu navegador y se recargará automáticamente cada vez que guardes un cambio.

**Alternativa por terminal (sin extensión):**
```bash
npx serve .
```
y abre la URL que te indique (normalmente `http://localhost:3000`).

## Publicarlo como webapp desde VS Code

Cualquiera de estas tres opciones funciona bien para un sitio estático como este. Todas se hacen desde la terminal integrada de VS Code (`Ctrl+ñ` o `View → Terminal`).

### Opción 1 — GitHub Pages (gratis, ideal si usas Git/GitHub)
```bash
git init
git add .
git commit -m "TradeQuest: juego de comercio internacional"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/tradequest.git
git push -u origin main

npm install
npm run deploy
```
El comando `npm run deploy` publica el sitio en la rama `gh-pages`. Luego, en GitHub → Settings → Pages, confirma que la fuente sea la rama `gh-pages`. Tu juego quedará en `https://TU-USUARIO.github.io/tradequest/`.

### Opción 2 — Netlify (arrastrar y soltar, sin comandos)
1. Entra a [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrastra la carpeta `trade-quest` completa a la página.
3. Netlify te da una URL pública al instante (puedes personalizarla después).

### Opción 3 — Vercel (desde la terminal de VS Code)
```bash
npm install -g vercel
vercel
```
Sigue las instrucciones en pantalla (crear cuenta si no tienes, confirmar carpeta del proyecto). Vercel te entrega una URL pública y, si haces `vercel --prod`, la deja como versión estable.

## Tabla de posiciones global (en vivo, con reinicio solo para la persona docente)

Por defecto cada estudiante guarda su puntaje solo en su propio navegador (modo local). Para que exista **una sola tabla compartida que se actualice sola** cada vez que alguien termina de jugar —perfecta para proyectar en la pantalla del aula mientras el grupo compite—, conecta el proyecto a **Firebase** (el servicio gratuito de Google para este tipo de datos en tiempo real). Solo se hace una vez; toma unos 10-15 minutos y no pide tarjeta de crédito (plan gratuito "Spark").

Con esto activado:
- Cada estudiante que termina una partida en modo Competencia aparece **automáticamente** en la tabla de todas las demás personas conectadas (sin recargar la página).
- El botón **"🗑️ Reiniciar tabla (docente)"** pide un correo y una contraseña. Solo la cuenta que tú registres como docente puede reiniciar la tabla; cualquier otra persona (incluido un estudiante que mire el código del sitio) es rechazada por las reglas de seguridad del propio servidor de la base de datos, no solo por la interfaz.

### Paso 1 — Crear el proyecto de Firebase
1. Entra a [console.firebase.google.com](https://console.firebase.google.com) con tu cuenta de Google y crea un proyecto nuevo (ej. "tradequest-comercio-internacional"). No hace falta activar Google Analytics.

### Paso 2 — Activar la base de datos (Firestore)
1. En el menú lateral: **Compilación → Firestore Database → Crear base de datos**.
2. Elige **modo producción** y la ubicación más cercana (por ejemplo `us-central`).

### Paso 3 — Activar el inicio de sesión de la persona docente
1. En el menú lateral: **Compilación → Authentication → Comenzar**.
2. En "Sign-in method", habilita el proveedor **Correo electrónico/contraseña**.
3. Ve a la pestaña **Users → Add user** y crea tu propia cuenta docente (tu correo + una contraseña). Esa es la única cuenta que podrá reiniciar la tabla.

### Paso 4 — Registrar la app web y copiar la configuración
1. En **Configuración del proyecto** (ícono de engranaje) → pestaña **General** → sección "Tus apps" → clic en el ícono **`</>`** (Web).
2. Ponle un nombre (ej. "TradeQuest web") y registra la app. No necesitas activar Firebase Hosting.
3. Firebase te muestra un objeto `firebaseConfig`. Cópialo completo.

### Paso 5 — Pegar la configuración en el proyecto
Abre `js/firebase-config.js` en VS Code y reemplaza los valores vacíos con los que copiaste:

```js
const FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "tradequest-xxxxx.firebaseapp.com",
  projectId: "tradequest-xxxxx",
  storageBucket: "tradequest-xxxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
};

const TEACHER_EMAIL = "tu-correo@ucr.ac.cr"; // el mismo que registraste en el Paso 3
```

En cuanto `apiKey` y `projectId` dejen de estar vacíos, el juego detecta la configuración automáticamente y la tabla pasa a ser global (verás el indicador **"🌐 Tabla global en vivo"** en la pantalla de posiciones).

### Paso 6 — Configurar las reglas de seguridad
En Firestore Database → pestaña **Reglas**, reemplaza el contenido por esto (cambiando el correo por el mismo del Paso 3) y publica:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{scoreId} {
      // Cualquiera puede AGREGAR su propio puntaje (validado), pero no editar los de otros.
      allow create: if request.resource.data.playerName is string
                    && request.resource.data.playerName.size() > 0
                    && request.resource.data.playerName.size() < 40
                    && request.resource.data.score is number
                    && request.resource.data.score >= 0
                    && request.resource.data.score < 100000;
      allow read: if true;
      allow update: if false;
      // Solo la cuenta docente autenticada puede borrar puntajes (reiniciar la tabla).
      allow delete: if request.auth != null
                    && request.auth.token.email == "tu-correo@ucr.ac.cr";
    }
  }
}
```

Esta regla es lo que hace cumplir de verdad el "solo la persona docente puede resetear": aunque alguien intente borrar datos directamente (sin usar el botón del juego), Firestore lo rechaza si no inició sesión con exactamente esa cuenta.

### Paso 7 — Probar y publicar
1. Prueba localmente con Live Server (ver sección anterior): juega una partida y confirma que aparece el indicador "🌐 Tabla global en vivo".
2. Abre el sitio en otro navegador o celular y juega otra partida: debería aparecer sola en la tabla de la primera pantalla, sin recargar.
3. Prueba el botón "🗑️ Reiniciar tabla (docente)" con tu correo/contraseña docente.
4. Publica el sitio con cualquiera de las opciones de la sección anterior (GitHub Pages, Netlify o Vercel) — la tabla global sigue funcionando igual, ya que vive en Firebase, no en el hosting.

> **Nota sobre seguridad:** esta configuración es apropiada para un juego de práctica en clase, no para datos sensibles o calificaciones oficiales. Un estudiante con conocimientos técnicos podría, en teoría, enviar un puntaje falso directamente a la base de datos (aunque no podría borrar ni alterar los de los demás). Si en algún momento quieres blindarlo más —por ejemplo, validando cada respuesta en un servidor antes de aceptar el puntaje—, se puede añadir después con Cloud Functions.

### Modo de respaldo sin internet
Si no configuras Firebase (o algún estudiante se queda sin conexión), el juego sigue funcionando normalmente en modo local. Para esos casos puntuales, cada estudiante puede descargar su resultado con **"⬇️ Descargar mi resultado"** y la persona docente puede cargarlo luego con **"⬆️ Importar resultado(s)"** como respaldo (esto no se mezcla con la tabla global, solo sirve para no perder un resultado si a alguien se le corta el internet a mitad de la partida).

## Personalización rápida

- **Colores**: cambia las variables al inicio de `css/styles.css` (`--accent`, `--gold`, etc.).
- **Tiempo por pregunta o puntaje**: ajusta `LEVEL_POINTS` y `LEVEL_TIME_SECONDS` en `js/game.js`.
- **Número de vidas**: constante `STARTING_LIVES` en `js/game.js`.
- **Título y textos**: directamente en `index.html`.
