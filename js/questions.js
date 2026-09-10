/**
 * TradeQuest — Banco de preguntas
 * Curso: Economía Internacional — Teorías modernas y nuevas teorías del comercio internacional
 *
 * CÓMO EDITAR / AGREGAR PREGUNTAS
 * --------------------------------
 * Cada pregunta es un objeto con esta forma:
 *
 *  {
 *    type: "mc" | "tf",          // "mc" = selección única, "tf" = verdadero/falso
 *    level: "Recordar" | "Comprender" | "Aplicar" | "Analizar",
 *    text: "Enunciado de la pregunta...",
 *    options: ["Opción A", "Opción B", "Opción C", "Opción D"], // en "tf" se ignora, se usa Verdadero/Falso
 *    correctIndex: 0,            // índice (0-based) de la opción correcta
 *    explanation: "Retroalimentación breve que ve el estudiante después de responder."
 *  }
 *
 * Para "tf", correctIndex es 0 para Verdadero y 1 para Falso.
 * El orden de las preguntas y de las opciones se mezcla automáticamente en cada partida,
 * así que no importa el orden en que las escribas aquí.
 *
 * Puedes agregar tantas preguntas como quieras: el juego las tomará todas.
 */

const QUESTIONS = [
  {
    type: "mc",
    level: "Recordar",
    text: "¿Quién formuló la Teoría del Ciclo del Producto presentada en clase?",
    options: ["Paul Krugman", "Raymond Vernon", "David Ricardo", "Eli Heckscher"],
    correctIndex: 1,
    explanation: "Raymond Vernon propuso la Teoría del Ciclo del Producto (1966) para explicar patrones dinámicos de comercio en manufacturas."
  },
  {
    type: "mc",
    level: "Comprender",
    text: "¿Por qué la Teoría del Ciclo del Producto plantea una ventaja comparativa dinámica?",
    options: [
      "Porque los costos de producción permanecen constantes durante toda la vida del producto.",
      "Porque todos los países producen el mismo bien simultáneamente.",
      "Porque el país que constituye la principal fuente de exportación puede cambiar conforme avanza el ciclo del producto.",
      "Porque los factores de producción son completamente inmóviles."
    ],
    correctIndex: 2,
    explanation: "La ventaja es dinámica porque el país líder en la exportación cambia según la etapa del ciclo: innovación, madurez y estandarización."
  },
  {
    type: "mc",
    level: "Aplicar",
    text: "Una empresa estadounidense acaba de introducir un producto tecnológico dirigido principalmente a consumidores de altos ingresos. La empresa produce cerca de esos consumidores para conocer rápidamente su reacción y todavía no exporta el producto. ¿En qué etapa del ciclo se encuentra?",
    options: ["Producto nuevo", "Maduración del producto", "Producto estandarizado", "Comercio intraindustrial"],
    correctIndex: 0,
    explanation: "Producir cerca de consumidores de altos ingresos para observar su reacción, sin exportar todavía, corresponde a la etapa de \"Producto nuevo\"."
  },
  {
    type: "mc",
    level: "Aplicar",
    text: "Un producto comienza a fabricarse mediante técnicas de producción masiva, aparecen normas más generales sobre sus características y aumenta su demanda en otros países desarrollados. ¿Qué etapa describe mejor esta situación?",
    options: ["Producto nuevo", "Maduración del producto", "Producto estandarizado", "Rezago de imitación"],
    correctIndex: 1,
    explanation: "La producción masiva, las normas más generales y la mayor demanda en otros países desarrollados corresponden a la \"Maduración del producto\"."
  },
  {
    type: "mc",
    level: "Aplicar",
    text: "Las características de un producto y su proceso de fabricación ya son ampliamente conocidas. La producción puede trasladarse hacia países en desarrollo y los costos laborales adquieren mayor importancia. ¿En qué etapa se encuentra?",
    options: ["Producto nuevo", "Maduración del producto", "Producto estandarizado", "Innovación inicial"],
    correctIndex: 2,
    explanation: "Cuando el producto y su proceso son ampliamente conocidos y la producción se traslada por costos laborales, se trata del \"Producto estandarizado\"."
  },
  {
    type: "mc",
    level: "Comprender",
    text: "La hipótesis del rezago de imitación de Michael Posner cuestiona particularmente el supuesto de que:",
    options: [
      "todos los países tienen los mismos consumidores.",
      "la misma tecnología está disponible en todas partes.",
      "todos los bienes utilizan únicamente trabajo.",
      "el comercio internacional siempre genera déficit."
    ],
    correctIndex: 1,
    explanation: "Posner cuestionó el supuesto de que la misma tecnología está disponible instantáneamente en todos los países: existe un rezago en su difusión."
  },
  {
    type: "mc",
    level: "Comprender",
    text: "¿Cuál de las siguientes situaciones representa mejor una economía de escala?",
    options: [
      "Una empresa duplica su producción y su costo promedio por unidad disminuye.",
      "Una empresa duplica la producción y aumenta sus costos totales.",
      "Dos países dejan de comerciar entre sí.",
      "El precio de un producto aumenta debido a un arancel."
    ],
    correctIndex: 0,
    explanation: "Hay economías de escala cuando, al aumentar la producción, el costo promedio por unidad disminuye."
  },
  {
    type: "mc",
    level: "Comprender",
    text: "¿Por qué surgieron teorías posteriores al modelo de Heckscher-Ohlin?",
    options: [
      "Porque se buscaba explicar el comercio considerando imperfecciones de mercado y rendimientos a escala.",
      "Porque el comercio internacional había desaparecido.",
      "Porque se comprobó que todos los países tenían las mismas dotaciones de factores.",
      "Porque dejaron de existir empresas multinacionales."
    ],
    correctIndex: 0,
    explanation: "Las teorías posteriores a Heckscher-Ohlin incorporaron imperfecciones de mercado y rendimientos crecientes a escala, algo que el modelo H-O no contemplaba."
  },
  {
    type: "mc",
    level: "Comprender",
    text: "¿Cuál fue una motivación fundamental para el desarrollo de la Nueva Teoría del Comercio?",
    options: [
      "Explicar por qué únicamente comercian países con dotaciones de factores muy diferentes.",
      "Explicar el importante comercio existente entre países similares en desarrollo, estructura y dotación de factores.",
      "Demostrar que los consumidores no valoran la variedad.",
      "Eliminar las economías de escala del análisis económico."
    ],
    correctIndex: 1,
    explanation: "La Nueva Teoría del Comercio surgió para explicar el intenso comercio entre países similares en desarrollo y dotación de factores, algo que H-O no explicaba bien."
  },
  {
    type: "mc",
    level: "Recordar",
    text: "¿Cuál economista aparece como el autor más destacado de la Nueva Teoría del Comercio desarrollada durante las décadas de 1970 y 1980?",
    options: ["Adam Smith", "Raymond Vernon", "Paul Krugman", "Wolfgang Stolper"],
    correctIndex: 2,
    explanation: "Paul Krugman es el economista más destacado de la Nueva Teoría del Comercio (Premio Nobel de Economía 2008 por este trabajo)."
  },
  {
    type: "mc",
    level: "Aplicar",
    text: "Alemania exporta determinados modelos de automóviles a Japón y Japón exporta otros modelos de automóviles a Alemania. ¿Cómo se clasifica principalmente este intercambio?",
    options: ["Comercio interindustrial.", "Comercio intraindustrial.", "Autarquía.", "Comercio basado únicamente en recursos naturales."],
    correctIndex: 1,
    explanation: "Intercambiar diferentes variedades de un mismo tipo de bien (automóviles) entre países es comercio intraindustrial."
  },
  {
    type: "mc",
    level: "Comprender",
    text: "Según la Nueva Teoría del Comercio, el comercio intraindustrial puede generar beneficios porque permite:",
    options: [
      "eliminar completamente la competencia.",
      "disponer de mayor variedad de productos y producirlos a menores costos promedio.",
      "impedir la especialización de las empresas.",
      "reducir el tamaño del mercado."
    ],
    correctIndex: 1,
    explanation: "El comercio intraindustrial permite mayor variedad de productos para los consumidores y menores costos promedio gracias a economías de escala."
  },
  {
    type: "mc",
    level: "Analizar",
    text: "Dos países tienen estructuras económicas y dotaciones de factores muy similares. Sin embargo, comercian intensamente diferentes variedades de un mismo producto manufacturado. ¿Cuál teoría explica mejor este patrón?",
    options: ["Mercantilismo.", "Ventaja absoluta exclusivamente.", "Nueva Teoría del Comercio.", "Modelo de un único factor de producción."],
    correctIndex: 2,
    explanation: "La Nueva Teoría del Comercio explica el comercio de variedades de un mismo producto entre países con estructuras y dotaciones similares."
  },
  {
    type: "mc",
    level: "Aplicar",
    text: "Suponga que dos mercados nacionales se integran mediante el comercio. Las empresas pueden ahora producir para un mercado más grande y su costo promedio disminuye. ¿Cuál concepto explica principalmente este resultado?",
    options: ["Rendimientos crecientes a escala.", "Autarquía.", "Rendimientos constantes a escala.", "Inmovilidad del capital."],
    correctIndex: 0,
    explanation: "Al integrarse los mercados, las empresas producen para un mercado más grande y logran rendimientos crecientes a escala, reduciendo su costo promedio."
  },
  {
    type: "tf",
    level: "Comprender",
    text: "En la primera etapa de la Teoría del Ciclo del Producto, el producto puede fabricarse y consumirse únicamente en el país innovador, por lo que inicialmente puede no existir comercio internacional.",
    correctIndex: 0,
    explanation: "Verdadero. En la etapa de \"producto nuevo\", la producción y el consumo suelen concentrarse en el país innovador, por lo que el comercio internacional puede ser mínimo o inexistente."
  },
  {
    type: "tf",
    level: "Comprender",
    text: "Según la Teoría del Ciclo del Producto, el país innovador necesariamente conserva durante todo el ciclo la producción y exportación mundial del producto.",
    correctIndex: 1,
    explanation: "Falso. Conforme el producto madura y se estandariza, la producción puede trasladarse a otros países; el país innovador no conserva la producción y exportación durante todo el ciclo."
  },
  {
    type: "tf",
    level: "Comprender",
    text: "La Nueva Teoría del Comercio permite explicar que la especialización y el comercio pueden aparecer incluso entre países que no presentan grandes diferencias en su dotación de recursos.",
    correctIndex: 0,
    explanation: "Verdadero. Krugman explica cómo puede haber especialización y comercio incluso entre países con dotaciones similares, gracias a economías de escala y a la preferencia por la variedad."
  },
  {
    type: "tf",
    level: "Analizar",
    text: "Si dos países poseen dotaciones de factores similares, la teoría presentada por Krugman implica que no existe ninguna razón para que comercien entre sí.",
    correctIndex: 1,
    explanation: "Falso. Según Krugman, precisamente entre países con dotaciones similares puede existir comercio intraindustrial motivado por economías de escala y variedad, no ausencia de comercio."
  },
  {
    type: "tf",
    level: "Comprender",
    text: "La visión trabajada en clase sobre la globalización cuestiona la idea de un mundo completamente \"plano\" o igual, pues la actividad económica y productiva continúa mostrando importantes concentraciones y desigualdades geográficas.",
    correctIndex: 0,
    explanation: "Verdadero. La perspectiva vista en clase cuestiona la idea de un mundo \"plano\", señalando que la actividad económica sigue mostrando concentraciones geográficas y desigualdades importantes."
  }
];

// No modificar esta línea: expone las preguntas al resto del juego.
if (typeof module !== "undefined") module.exports = QUESTIONS;
