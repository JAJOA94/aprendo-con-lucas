/* =========================================================
   APRENDE CON LUCAS — app.js
   Navegación entre pantallas, voz en español (Web Speech API)
   y juegos de "encuentra la pareja".

   Un solo MOTOR (crearJuegoDeOpciones) alimenta a todos los juegos:
   mostrar algo grande + su pregunta, decirlo en voz alta, elegir
   entre 3 opciones grandes, celebrar el acierto y dar ánimo amable
   (nunca reproches) cuando se equivoca.

   Módulos terminados:
     COLORES (6)  NÚMEROS (1 al 10)  FORMAS (5)
     CONTAR OBJETOS (1 al 5)  ANIMALES (25)

   VOZ: se elige la mejor voz española que ofrezca el navegador y
   cada frase lleva su propia entonación (celebración alegre, ánimo
   cálido, pregunta clara). Si no hubiera ninguna voz española, se
   usa la mejor alternativa disponible sin que nada falle.

   SONIDOS: los juegos pueden pedir tonos cortos generados por el
   propio navegador (Web Audio API), sin descargar nada; además ya hay
   sonidos REALES de animales en assets/sonidos/ (mp3 de licencia
   libre, con sus créditos y enlaces en la sección de sonidos).
   Los animales que aún no tienen archivo suenan con un tonito suave,
   sin dar ningún error.

   Sin librerías, sin backend. JavaScript puro (vanilla).
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     1. CONFIGURACIÓN GENERAL
     ======================================================= */
  const CONFIG = {
    idioma:     "es-ES",   // idioma preferido para la voz
    vozActiva:  true,

    /* Entonación según el tipo de frase.
       alegre   → celebración: más aguda, más viva y marcada.
       animo    → ánimo: más despacio y cálida, sin sonar severa.
       pregunta → clara y cantarina, invita a responder.
       normal   → avisos y saludos. */
    estilos: {
      normal:   { rate: 0.88, pitch: 1.15, volume: 1 },
      pregunta: { rate: 0.85, pitch: 1.25, volume: 1 },
      animo:    { rate: 0.82, pitch: 1.30, volume: 1 },
      alegre:   { rate: 1.00, pitch: 1.50, volume: 1 }
    },
    estiloPorDefecto: "normal",

    /* Tonos cortos generados por el navegador (sin archivos).
       El botón 🔊 apaga la voz y también estos tonos. */
    sonidosPropios: true,

    /* Sonidos REALES de animales: hay 17 de los 25 en assets/sonidos/
       (perro.mp3, gato.mp3, leon.mp3...). Con esto en true, el botón 🔊
       reproduce el sonido de verdad del animal.
       Solo se pide un archivo que esté en la lista SONIDOS_LISTOS, así
       que el navegador NUNCA intenta cargar un archivo que no existe. */
    sonidosDeAnimales: true,

    /* Para los animales que todavía no tienen mp3, el botón 🔊 de su
       opción hace un tonito corto para que el niño note que funciona. */
    tonoDeEscucha: true
  };

  /* =======================================================
     0-BIS. IDIOMA DEL JUEGO (español / inglés)
     ======================================================= */
  /* Un solo juego con dos idiomas: cambian los textos, los nombres,
     las preguntas, los botones y la voz; la lógica es exactamente la
     misma. Para añadir otro idioma mañana basta con añadir su bloque
     en TEXTOS y sus nombres en los mapas _EN. */
  let IDIOMA = "es";                 // "es" o "en": se elige al abrir

  /* Nombres de los elementos en inglés (los datos ya traen el español).
     Se indexan por módulo y por id del elemento. */
  const NOMBRES_EN = {
    color: {
      rojo: "Red", azul: "Blue", amarillo: "Yellow",
      verde: "Green", naranjo: "Orange", morado: "Purple",
      rosado: "Pink", cafe: "Brown", negro: "Black", blanco: "White",
      gris: "Gray", celeste: "Light blue", beige: "Beige",
      fucsia: "Fuchsia", violeta: "Violet", turquesa: "Turquoise",
      dorado: "Gold", plateado: "Silver", lima: "Lime", cian: "Cyan"
    },
    numero: {
      1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
      6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten"
    },
    forma: {
      circulo: "Circle", cuadrado: "Square", triangulo: "Triangle",
      rectangulo: "Rectangle", estrella: "Star", corazon: "Heart",
      rombo: "Diamond", ovalo: "Oval", cruz: "Cross"
    },
    animal: {
      perro: "Dog", gato: "Cat", vaca: "Cow", cerdo: "Pig", leon: "Lion",
      elefante: "Elephant", rana: "Frog", mono: "Monkey", tigre: "Tiger",
      oso: "Bear", panda: "Panda", zorro: "Fox", conejo: "Rabbit",
      raton: "Mouse", hamster: "Hamster", koala: "Koala", jirafa: "Giraffe",
      cebra: "Zebra", rinoceronte: "Rhinoceros", hipopotamo: "Hippopotamus",
      cocodrilo: "Crocodile", tortuga: "Turtle", serpiente: "Snake",
      pinguino: "Penguin", buho: "Owl"
    },
    fruta: {
      manzana: "Apple", manzanaverde: "Green apple", platano: "Banana",
      naranja: "Orange", frutilla: "Strawberry", uva: "Grapes",
      sandia: "Watermelon", pina: "Pineapple", mango: "Mango",
      durazno: "Peach", pera: "Pear", cereza: "Cherry", kiwi: "Kiwi",
      limon: "Lemon", coco: "Coconut", melon: "Melon",
      arandano: "Blueberry", tomate: "Tomato", palta: "Avocado",
      aceituna: "Olive"
    }
  };

  /* Todos los textos del juego, por idioma. */
  const TEXTOS = {
    es: {
      /* --- pantalla de idioma --- */
      idiomaPregunta: "¿Qué idioma quieres aprender?",
      idiomaEspanol: "ESPAÑOL",
      idiomaIngles: "ENGLISH",

      /* --- menú e interfaz --- */
      saludo: "¡Vamos a aprender y jugar!",
      menu: "Menú",
      escuchar: "Escuchar",
      escucharPregunta: "Escuchar otra vez la pregunta",
      escucharNombre: "Escuchar el nombre",
      vozActivar: "Activar la voz",
      vozDesactivar: "Desactivar la voz",
      vozActivada: "Voz activada",
      pie: "Hecho con 💛 para Lucas",

      /* --- títulos de las secciones --- */
      tituloColores: "LOS COLORES",
      tituloNumeros: "LOS NÚMEROS",
      tituloFormas: "LAS FORMAS",
      tituloContar: "CONTAR OBJETOS",
      tituloAnimales: "LOS ANIMALES",
      tituloFrutas: "LAS FRUTAS",

      /* --- etiquetas (aria-label) --- */
      etiquetaColor: "Color",
      etiquetaNumero: "Número",
      etiquetaForma: "Forma",
      etiquetaAnimal: "Animal",
      etiquetaFruta: "Fruta",

      /* --- frases que se dicen en voz alta --- */
      contar: "¿Cuántos hay?",
      animales: "¿Qué animal es?",
      frutas: "¿Qué fruta es?",
      fraseColor: "{nombre}. Toca el color {nombre}.",
      fraseNumero: "{palabra}. Toca el número {palabra}.",
      fraseForma: "{nombre}. Toca {articulo}{minuscula}.",
      aciertoItem: "¡Muy bien! Es {articulo}{nombre}.",
      articuloUn: "un",
      articuloUna: "una",
      conjuncion: " y ",

      /* --- mensajes compartidos (nunca negativos) --- */
      mensajes: {
        acierto:       "¡Muy bien!",
        aciertoVisual: "¡Muy bien! 🎉",
        animo:         "¡Vamos a intentarlo otra vez!",
        animoVisual:   "¡Vamos a intentarlo otra vez! 👋",
        animoContar:         "¡Vamos a contarlos otra vez!",
        animoContarVisual:   "¡Vamos a contarlos otra vez! 👋"
      },

      /* --- módulos nuevos: títulos --- */
      tituloVehiculos: "LOS VEHÍCULOS",
      tituloCuerpo: "EL CUERPO",
      tituloVocales: "LAS VOCALES",
      tituloAlimentos: "LOS ALIMENTOS",
      tituloCasa: "LA CASA",
      tituloFamilia: "LA FAMILIA",
      tituloColoresObjetos: "COLORES Y OBJETOS",
      tituloDondeVive: "¿DÓNDE VIVE?",
      tituloQueSonido: "¿QUÉ SONIDO ES?",
      tituloMemoria: "MEMORIA",
      tituloConceptos: "CONCEPTOS Y POSICIONES",
      tituloEmociones: "EMOCIONES",

      /* --- módulos nuevos: etiquetas del menú --- */
      menuColores: "Colores",
      menuNumeros: "Números",
      menuFormas: "Formas",
      menuContar: "Contar",
      menuAnimales: "Animales",
      menuFrutas: "Frutas",
      menuVehiculos: "Vehículos",
      menuCuerpo: "Cuerpo",
      menuVocales: "Vocales",
      menuAlimentos: "Alimentos",
      menuCasa: "Casa",
      menuFamilia: "Familia",
      menuColoresObjetos: "Colores y objetos",
      menuDondeVive: "¿Dónde vive?",
      menuQueSonido: "¿Qué sonido es?",
      menuMemoria: "Memoria",
      menuConceptos: "Conceptos",
      menuEmociones: "Emociones",

      /* --- módulos nuevos: etiquetas de accesibilidad --- */
      etiquetaVehiculo: "Vehículo",
      etiquetaCuerpo: "Parte del cuerpo",
      etiquetaVocal: "Vocal",
      etiquetaAlimento: "Alimento",
      etiquetaCasa: "Objeto de la casa",
      etiquetaFamilia: "Familia",
      etiquetaObjeto: "Objeto",
      etiquetaLugar: "Lugar",
      etiquetaConcepto: "Concepto",
      etiquetaEmocion: "Emoción",

      /* --- módulos nuevos: preguntas --- */
      vehiculos: "¿Qué vehículo es?",
      cuerpo: "¿Qué parte del cuerpo es?",
      vocales: "¿Qué vocal es?",
      alimentos: "¿Qué alimento es?",
      casa: "¿Qué objeto de la casa es?",
      familia: "¿Quién es?",
      buscaAlgo: "Busca algo {color}.",
      dondeVive: "¿Dónde vive?",
      queSonido: "¿Qué sonido es?",
      conceptos: "¿Cuál es?",
      emociones: "¿Cómo se siente?",

      /* --- frases propias de los módulos nuevos --- */
      esVocal: "Esta es la {nombre}.",
      aciertoVocal: "¡Muy bien! Es la {nombre}.",
      aciertoEmocion: "¡Muy bien! Está {nombre}.",
      refuerzoVive: "{animal} vive en {lugar}.",
      parejas: "Parejas",
      aciertoMemoria: "¡Muy bien! 🎉",
      sonidoAnimal: "Ese sonido es del {animal}.",
      /* --- etapas de los módulos (APRENDER / JUGAR) --- */
      aprender: "APRENDER",
      jugar: "JUGAR",
      volver: "Volver",
      inicio: "Inicio",
      tocaUnColor: "Toca un color",
      tocaUnNumero: "Toca un número",
      tocaUnaForma: "Toca una forma",
      tocaUnObjeto: "Toca un objeto",
      tocaUnAnimal: "Toca un animal",
      tocaUnaFruta: "Toca una fruta",
      /* --- grupos del menú --- */
      grupoEtapas: "📚 Aprender y jugar",
      grupoDirectos: "🎮 Juegos directos",

      /* --- pistas de las etapas APRENDER --- */
      tocaUnVehiculo: "Toca un vehículo",
      tocaUnaParte: "Toca una parte del cuerpo",
      tocaUnaVocal: "Toca una vocal",
      tocaUnAlimento: "Toca un alimento",
      tocaUnaFamilia: "Toca un miembro de la familia",
      tocaUnConcepto: "Toca un concepto",
      tocaUnaEmocion: "Toca una emoción",
      tocaUnObjetoColor: "Toca un objeto",

      /* --- clasificación de los colores --- */
      grupoPrimarios: "Primarios",
      grupoSecundarios: "Secundarios",
      grupoTerciarios: "Terciarios",
      grupoOtros: "Otros",

      /* --- Colores y objetos: objeto + color --- */
      objetoYColor: "{objeto} de color {color}.",
      preguntaDeQueColor: "¿De qué color es {objeto}?",
      preguntaCualEs: "¿Cuál es {color}?",
      preguntaBuscaObjeto: "Busca el objeto {color}.",
      aciertoObjetoColor: "¡Muy bien! El color de {objeto} es {color}.",
      aciertoColorObjeto: "¡Muy bien! Es {objeto}.",

      /* --- Laberintos --- */
      laberintoPista: "Lleva el conejito hasta la zanahoria",
      laberintoLlegada: "¡Llegaste!",

      /* --- Memoria --- */
      memoriaMirar: "¡Mira bien las cartas!",
      memoriaNivel: "Parejas",

      tituloLaberintos: "LABERINTOS",
      menuLaberintos: "Laberintos",
      etiquetaLaberinto: "Camino",

      /* --- álbum de APRENDER --- */
      pistaCategorias: "Toca una categoría",
      volverCategorias: "Categorías",
      coloresPalabra: "colores",
      albumAntes: "Anterior",
      albumDespues: "Siguiente",
      albumTarjeta: "Tarjeta",
      albumProgreso: "Progreso",
      figuraCuerpo: "El cuerpo",

      /* MARCA_NUEVOS_ES: aquí van los textos de los módulos nuevos del español */
    },

    en: {
      /* --- language screen --- */
      idiomaPregunta: "What language do you want to learn?",
      idiomaEspanol: "ESPAÑOL",
      idiomaIngles: "ENGLISH",

      /* --- menu and interface --- */
      saludo: "Let's learn and play!",
      menu: "Menu",
      escuchar: "Listen",
      escucharPregunta: "Hear the question again",
      escucharNombre: "Hear the name",
      vozActivar: "Turn the voice on",
      vozDesactivar: "Turn the voice off",
      vozActivada: "Voice on",
      pie: "Made with 💛 for Lucas",

      /* --- section titles --- */
      tituloColores: "COLORS",
      tituloNumeros: "NUMBERS",
      tituloFormas: "SHAPES",
      tituloContar: "COUNT THE OBJECTS",
      tituloAnimales: "ANIMALS",
      tituloFrutas: "FRUITS",

      /* --- labels (aria-label) --- */
      etiquetaColor: "Color",
      etiquetaNumero: "Number",
      etiquetaForma: "Shape",
      etiquetaAnimal: "Animal",
      etiquetaFruta: "Fruit",

      /* --- spoken phrases --- */
      contar: "How many are there?",
      animales: "What animal is this?",
      frutas: "What fruit is this?",
      fraseColor: "{nombre}. Touch the color {nombre}.",
      fraseNumero: "{palabra}. Touch the number {palabra}.",
      fraseForma: "{nombre}. Touch the {minuscula}.",
      aciertoItem: "Very good! It's a {nombre}.",
      articuloUn: "",
      articuloUna: "",
      conjuncion: " and ",

      /* --- shared messages (never negative) --- */
      mensajes: {
        acierto:       "Very good!",
        aciertoVisual: "Very good! 🎉",
        animo:         "Let's try again!",
        animoVisual:   "Let's try again! 👋",
        animoContar:         "Let's count them again!",
        animoContarVisual:   "Let's count them again! 👋"
      },

      /* --- new modules: titles --- */
      tituloVehiculos: "VEHICLES",
      tituloCuerpo: "THE BODY",
      tituloVocales: "THE VOWELS",
      tituloAlimentos: "FOOD",
      tituloCasa: "THE HOUSE",
      tituloFamilia: "THE FAMILY",
      tituloColoresObjetos: "COLORS AND OBJECTS",
      tituloDondeVive: "WHERE DOES IT LIVE?",
      tituloQueSonido: "WHAT SOUND IS IT?",
      tituloMemoria: "MEMORY",
      tituloConceptos: "CONCEPTS AND POSITIONS",
      tituloEmociones: "EMOTIONS",

      /* --- new modules: menu labels --- */
      menuColores: "Colors",
      menuNumeros: "Numbers",
      menuFormas: "Shapes",
      menuContar: "Count",
      menuAnimales: "Animals",
      menuFrutas: "Fruits",
      menuVehiculos: "Vehicles",
      menuCuerpo: "Body",
      menuVocales: "Vowels",
      menuAlimentos: "Food",
      menuCasa: "House",
      menuFamilia: "Family",
      menuColoresObjetos: "Colors & objects",
      menuDondeVive: "Where does it live?",
      menuQueSonido: "What sound?",
      menuMemoria: "Memory",
      menuConceptos: "Concepts",
      menuEmociones: "Emotions",

      /* --- new modules: accessibility labels --- */
      etiquetaVehiculo: "Vehicle",
      etiquetaCuerpo: "Body part",
      etiquetaVocal: "Vowel",
      etiquetaAlimento: "Food",
      etiquetaCasa: "Household object",
      etiquetaFamilia: "Family",
      etiquetaObjeto: "Object",
      etiquetaLugar: "Place",
      etiquetaConcepto: "Concept",
      etiquetaEmocion: "Emotion",

      /* --- new modules: questions --- */
      vehiculos: "What vehicle is this?",
      cuerpo: "What body part is this?",
      vocales: "Which vowel is this?",
      alimentos: "What food is this?",
      casa: "What household object is this?",
      familia: "Who is this?",
      buscaAlgo: "Find something {color}.",
      dondeVive: "Where does it live?",
      queSonido: "What animal makes this sound?",
      conceptos: "Which one is it?",
      emociones: "How does he/she feel?",

      /* --- phrases of the new modules --- */
      esVocal: "This is {nombre}.",
      aciertoVocal: "Very good! It's {nombre}.",
      aciertoEmocion: "Very good! She is {nombre}.",
      refuerzoVive: "The {animal} lives in the {lugar}.",
      parejas: "Pairs",
      aciertoMemoria: "Very good! 🎉",
      sonidoAnimal: "That sound is the {animal}.",
      /* --- module stages (LEARN / PLAY) --- */
      aprender: "LEARN",
      jugar: "PLAY",
      volver: "Back",
      inicio: "Home",
      tocaUnColor: "Touch a color",
      tocaUnNumero: "Touch a number",
      tocaUnaForma: "Touch a shape",
      tocaUnObjeto: "Touch an object",
      tocaUnAnimal: "Touch an animal",
      tocaUnaFruta: "Touch a fruit",
      /* --- menu groups --- */
      grupoEtapas: "📚 Learn and play",
      grupoDirectos: "🎮 Games",

      /* --- LEARN stage hints --- */
      tocaUnVehiculo: "Touch a vehicle",
      tocaUnaParte: "Touch a body part",
      tocaUnaVocal: "Touch a vowel",
      tocaUnAlimento: "Touch a food",
      tocaUnaFamilia: "Touch a family member",
      tocaUnConcepto: "Touch a concept",
      tocaUnaEmocion: "Touch an emotion",
      tocaUnObjetoColor: "Touch an object",

      /* --- colour groups --- */
      grupoPrimarios: "Primary",
      grupoSecundarios: "Secondary",
      grupoTerciarios: "Tertiary",
      grupoOtros: "Others",

      /* --- Colours and objects: object + colour --- */
      objetoYColor: "{objeto} is {color}.",
      preguntaDeQueColor: "What colour is this {objeto}?",
      preguntaCualEs: "Which one is {color}?",
      preguntaBuscaObjeto: "Find the {color} object.",
      aciertoObjetoColor: "Very good! The colour of {objeto} is {color}.",
      aciertoColorObjeto: "Very good! It's {objeto}.",

      /* --- Mazes --- */
      laberintoPista: "Take the bunny to the carrot",
      laberintoLlegada: "You made it!",

      /* --- Memory --- */
      memoriaMirar: "Look at the cards!",
      memoriaNivel: "Pairs",

      tituloLaberintos: "MAZES",
      menuLaberintos: "Mazes",
      etiquetaLaberinto: "Path",

      /* --- LEARN album --- */
      pistaCategorias: "Touch a category",
      volverCategorias: "Categories",
      coloresPalabra: "colours",
      albumAntes: "Previous",
      albumDespues: "Next",
      albumTarjeta: "Card",
      albumProgreso: "Progress",
      figuraCuerpo: "The body",

      /* MARCA_NUEVOS_EN: here go the new module texts in English */
    }
  };

  /* ---------- ayudantes del idioma ---------- */

  /* Texto de interfaz en el idioma elegido */
  function t(clave) {
    const idioma = TEXTOS[IDIOMA] || TEXTOS.es;
    return (clave in idioma) ? idioma[clave] : (TEXTOS.es[clave] || clave);
  }

  /* Texto con huecos: f("¡Hola {nombre}!", { nombre: "Lucas" }) */
  function f(plantilla, datos) {
    return String(plantilla).replace(/\{(\w+)\}/g, (todo, clave) =>
      (datos && clave in datos) ? datos[clave] : "");
  }

  /* Nombre de un elemento en el idioma elegido.
     modulo: "color", "animal", "fruta"... (para los mapas en inglés) */
  function nombreDe(item, modulo) {
    if (!item) return "";
    if (IDIOMA === "es") return item.nombre || "";
    if (item.nombreEn) return item.nombreEn;
    const mapa = NOMBRES_EN[modulo];
    return (mapa && mapa[item.id]) || item.nombre || "";
  }

  /* Palabra escrita de un número (1-10) en el idioma elegido */
  function palabraDe(numero) {
    if (!numero) return "";
    if (IDIOMA === "es") return numero.palabra || "";
    return NOMBRES_EN.numero[numero.valor] || numero.palabra || "";
  }

  /* Artículo que acompaña al nombre: "un perro" / "a dog" / "el círculo" */
  function articuloDe(item) {
    if (IDIOMA === "en") return "";
    return item && item.articulo ? item.articulo + " " : "";
  }

  /* Frases compartidas por todos los juegos, EN EL IDIOMA ELEGIDO.
     Nunca hay palabras negativas: solo celebración o ánimo. */
  function mensajes() {
    return TEXTOS[IDIOMA].mensajes;
  }

  const OPCIONES_POR_RONDA = 3;   // 1 correcta + 2 para elegir

  /* =======================================================
     2. ATAJOS DEL DOM
     ======================================================= */
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const botonVoz = $("#boton-voz");
  const botonInicio = $("#boton-inicio");
  const botonVolverTop = $("#boton-volver-top");

  /* =======================================================
     3. VOZ (Web Speech API — incluida en el navegador)
     ======================================================= */
  /* Nombres de voces que suelen sonar más cálidas y naturales.
     No son obligatorias: si no están, se usa la mejor disponible. */
  const VOCES_PREFERIDAS =
    /google|microsoft|natural|neural|premium|enhanced|sabina|helena|laura|monica|paulina|dalia|camila|jorge|diego|carlos|elvira|marisol|samantha|zira|aria|jenny|guy|david|mark|ana|andrew|emma|brian|ava|liam/i;

  let vocesDisponibles = [];
  let vozElegida       = null;

  /* ¿Este navegador tiene voz disponible? */
  function hayVoz() {
    return typeof window !== "undefined" && !!window.speechSynthesis;
  }

  /* Puntúa una voz para el IDIOMA ELEGIDO: cuanto más alta la nota,
     mejor nos suena. Primero una voz del idioma elegido; si no hubiera
     ninguna, se usa la mejor disponible y el juego nunca se queda mudo. */
  function puntuarVoz(voz) {
    const lang = String(voz.lang || "").toLowerCase();
    const base = (IDIOMA === "en") ? "en" : "es";
    const otro = (base === "en") ? "es" : "en";
    let puntos = 0;

    if (lang.indexOf(base) === 0) puntos += 300;             // el idioma elegido, lo primero
    else if (lang.indexOf(otro) === 0) puntos += 20;         // el otro idioma, solo como último recurso

    if (base === "es") {
      if (/^es[-_]es/i.test(lang)) puntos += 30;             // castellano
      else if (/^es[-_](mx|us|419|ar|cl|co)/i.test(lang)) puntos += 25;   // latino
    } else {
      if (/^en[-_]us/i.test(lang)) puntos += 30;
      else if (/^en[-_]gb/i.test(lang)) puntos += 25;
    }
    if (VOCES_PREFERIDAS.test(String(voz.name || ""))) puntos += 20;
    if (voz.localService) puntos += 2;                       // suele sonar sin cortes

    return puntos;
  }

  /* Carga las voces del navegador (pueden tardar en estar listas) */
  function cargarVoces() {
    if (!hayVoz()) return;

    vocesDisponibles = window.speechSynthesis.getVoices() || [];
    if (!vocesDisponibles.length) return;

    /* Nos quedamos con la mejor puntuada. Si ninguna fuera española,
       igualmente hablamos con la que haya: el juego nunca se queda mudo. */
    vozElegida = vocesDisponibles
      .slice()
      .sort((a, b) => puntuarVoz(b) - puntuarVoz(a))[0] || null;
  }

  /* Dice un texto en voz alta.
     estilo: "normal" | "pregunta" | "animo" | "alegre" */
  function hablar(texto, estilo) {
    if (!CONFIG.vozActiva || !texto) return;
    if (!hayVoz()) return;

    try {
      // Las voces pueden cargarse después de arrancar: reintentamos
      if (!vozElegida) cargarVoces();

      const tono = CONFIG.estilos[estilo] || CONFIG.estilos[CONFIG.estiloPorDefecto];

      window.speechSynthesis.cancel(); // corta lo anterior y habla limpio

      const frase = new SpeechSynthesisUtterance(texto);
      frase.lang   = (vozElegida && vozElegida.lang) ||
                     (IDIOMA === "en" ? "en-US" : "es-ES");
      frase.voice  = vozElegida || null;
      frase.rate   = tono.rate;
      frase.pitch  = tono.pitch;
      frase.volume = tono.volume;

      window.speechSynthesis.speak(frase);
    } catch (error) {
      // Si la voz falla, el juego debe seguir funcionando igual
      console.warn("No se pudo reproducir la voz:", error);
    }
  }

  /* Corta cualquier voz en curso (al cambiar de pantalla, por ejemplo) */
  function detenerVoz() {
    if (hayVoz()) window.speechSynthesis.cancel();
    detenerAudio();
  }

  /* Enciende / apaga la voz (y los tonos cortos) */
  function alternarVoz() {
    CONFIG.vozActiva = !CONFIG.vozActiva;

    botonVoz.textContent = CONFIG.vozActiva ? "🔊" : "🔇";
    botonVoz.classList.toggle("apagado", !CONFIG.vozActiva);
    botonVoz.setAttribute(
      "aria-label",
      CONFIG.vozActiva ? "Desactivar la voz" : "Activar la voz"
    );

    if (CONFIG.vozActiva) {
      hablar("Voz activada", "alegre");
    } else {
      detenerVoz();
    }
  }

  /* =======================================================
     4. SONIDOS DEL PROPIO NAVEGADOR (sin archivos)
     ======================================================= */
  /* Tonos cortos creados con la Web Audio API del navegador: no hay
     que descargar nada ni usar ningún servicio. Solo suenan en los
     juegos que los piden (cfg.sonidos), así los módulos anteriores no
     cambian en nada. El botón 🔊 silencia voz y tonos. */

  let contextoAudio = null;

  const TONOS = {
    /* Celebración: dos notas ascendentes y alegres (sol5 → do6) */
    acierto: [
      { f: 784.0,  t: 0.00, d: 0.16 },
      { f: 1046.5, t: 0.13, d: 0.30 }
    ],
    /* Ánimo: una sola nota suave y grave, nunca severa (sol4) */
    animo: [
      { f: 392.0, t: 0.00, d: 0.26 }
    ],
    /* Escuchar: dos notitas cortas y suaves, para el botón 🔊 de las
       opciones. Solo suenan mientras no haya sonidos reales. */
    escucha: [
      { f: 659.3, t: 0.00, d: 0.09 },
      { f: 880.0, t: 0.08, d: 0.12 }
    ]
  };

  function sonidosActivos() {
    return CONFIG.sonidosPropios && CONFIG.vozActiva;
  }

  function sonarTono(notas) {
    if (!sonidosActivos() || typeof window === "undefined") return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;          // el navegador no lo soporta: sin tonos

    try {
      if (!contextoAudio) contextoAudio = new AudioCtx();
      if (contextoAudio.state === "suspended") contextoAudio.resume();

      const inicio = contextoAudio.currentTime;

      notas.forEach(nota => {
        const osc = contextoAudio.createOscillator();
        const vol = contextoAudio.createGain();

        osc.type = "sine";
        osc.frequency.value = nota.f;

        vol.gain.setValueAtTime(0.0001, inicio + nota.t);
        vol.gain.exponentialRampToValueAtTime(0.16, inicio + nota.t + 0.02);
        vol.gain.exponentialRampToValueAtTime(0.0001, inicio + nota.t + nota.d);

        osc.connect(vol);
        vol.connect(contextoAudio.destination);

        osc.start(inicio + nota.t);
        osc.stop(inicio + nota.t + nota.d + 0.03);
      });
    } catch (error) {
      // Si el audio no está permitido, el juego sigue igual
      console.warn("No se pudo reproducir el sonido:", error);
    }
  }

  /* ---------- sonidos reales de los animales ----------
     Los archivos están en assets/sonidos/, un mp3 por animal:
        assets/sonidos/perro.mp3 · gato.mp3 · leon.mp3 ...
     Son sonidos de licencia libre (CC0 y CC BY); los créditos están
     abajo y se muestran también en la consola al arrancar.

     SOLO se pide un archivo si su animal está en SONIDOS_LISTOS: así el
     navegador NUNCA intenta reproducir un archivo que no existe.

     Para añadir los que faltan (cebra, cocodrilo, hamster, jirafa,
     koala, panda, tortuga, zorro): deja el mp3 en assets/sonidos/ con el
     nombre del animal (cebra.mp3, zorro.mp3...) y añade ese nombre a la
     lista SONIDOS_LISTOS. Nada más. */
  const SONIDOS_LISTOS = [
    "perro", "gato", "vaca", "cerdo", "leon", "elefante", "rana", "mono",
    "tigre", "oso", "raton", "hipopotamo", "serpiente", "pinguino",
    "buho", "conejo", "rinoceronte"
  ];

  /* Créditos de cada sonido (título · autor · licencia · enlace), como
     pide la licencia. Origen: Freesound.org. */
  const CREDITOS_SONIDOS = {
    perro:       "Dog barks · 16FVolejnikovaA · CC0 · freesound.org/s/498394",
    gato:        "Cat meow · philsapphire · CC0 · freesound.org/s/256452",
    vaca:        "Cow moo #3 · spurioustransients · CC0 · freesound.org/s/513557",
    cerdo:       "Pig Grunt 5 · JarredGibb · CC0 · freesound.org/s/233173",
    leon:        "lion roar · bkyte · CC0 · freesound.org/s/510476",
    elefante:    "Elephant Trumpets Growls · D.jones · CC0 · freesound.org/s/527845",
    rana:        "Frog croaking · betterchinese · CC0 · freesound.org/s/354132",
    mono:        "monkeys-1 · xserra · CC BY 4.0 · freesound.org/s/93993",
    tigre:       "Tiger Roar · lauramellis · CC0 · freesound.org/s/263115",
    oso:         "grizzly bear growl · Nivatius · CC0 · freesound.org/s/519596",
    raton:       "Mice Squeaks · berboberbo · CC0 · freesound.org/s/727114",
    hipopotamo:  "Hippo, oiseaux, gnous · roubignolle · CC BY 4.0 · freesound.org/s/35132",
    serpiente:   "Snake hissing · schreibsel · CC0 · freesound.org/s/540162",
    pinguino:    "African penguins · Vortichez · CC BY 4.0 · freesound.org/s/545415",
    buho:        "Owl Hooting · howebzar · CC0 · freesound.org/s/415153",
    conejo:      "Rabbit Squeaking · kessir · CC BY 4.0 · freesound.org/s/385850",
    rinoceronte: "Rhinoceros Trumpet · bevibeldesign · CC0 · freesound.org/s/350419"
  };

  const SONIDOS = {
    carpeta:   "assets/sonidos/",
    extension: ".mp3",
    cache:     {}          // un elemento de audio por animal (se reutiliza)
  };

  /* El audio que está sonando ahora mismo. Antes de poner otro sonido se
     corta el anterior: así al tocar un objeto y luego otro, el primero
     deja de sonar (nunca se solapan dos sonidos). */
  let audioActual = null;

  function detenerAudio() {
    if (!audioActual) return;
    try {
      audioActual.pause();
      audioActual.currentTime = 0;
    } catch (error) { /* si el navegador no lo permite, no pasa nada */ }
    audioActual = null;
  }

  /* ¿Este animal tiene ya su archivo de sonido? */
  function haySonidoDe(animal) {
    return !!animal && SONIDOS_LISTOS.indexOf(animal.sonido) !== -1;
  }

  /* Devuelve el audio de un animal, o null si no hay archivo o falla. */
  function audioDeAnimal(animal) {
    if (!haySonidoDe(animal)) return null;     // nunca pedimos un archivo inexistente
    if (animal.sonido in SONIDOS.cache) return SONIDOS.cache[animal.sonido];

    let audio = null;
    try {
      audio = new window.Audio(SONIDOS.carpeta + animal.sonido + SONIDOS.extension);
      audio.volume = 0.9;
      // Si por lo que sea el archivo no se puede usar, se ignora en silencio
      audio.addEventListener("error", () => { SONIDOS.cache[animal.sonido] = null; });
    } catch (error) {
      audio = null;        // navegador sin Audio(): el juego sigue igual
    }

    SONIDOS.cache[animal.sonido] = audio;
    return audio;
  }

  /* Reproduce el sonido REAL del animal.
     Si no hubiera archivo (o el navegador lo bloquea), no pasa nada. */
  function sonarAnimal(animal) {
    if (!CONFIG.sonidosDeAnimales) return;

    const audio = audioDeAnimal(animal);
    if (!audio) return;

    if (audioActual && audioActual !== audio) detenerAudio();  // nunca suenan dos a la vez

    try {
      audio.currentTime = 0;      // si se repite, empieza desde el principio
      audioActual = audio;
      const intento = audio.play();
      // play() devuelve una promesa: si algo falla, se ignora
      if (intento && typeof intento.catch === "function") intento.catch(() => {});
    } catch (error) {
      // Algunos navegadores avisan si no hay gesto previo: se ignora
    }
  }

  /* =======================================================
     5. MOTOR DE JUEGOS DE OPCIONES
     ======================================================= */
  /* Cada juego solo describe QUÉ se juega (sus elementos, cómo se
     pintan y qué se dice). Toda la mecánica vive aquí dentro:
     rondas al azar sin repetir, 3 opciones mezcladas, celebración
     con estrellas, contador de aciertos, ánimo amable y cambio
     automático de ronda.

     cfg = {
       nombre,                            // para los mensajes de consola
       ids: { opciones, objetivo, nombre, aviso, fiesta, marcador },
       items,                             // lista de cosas jugables
       dato,                              // nombre del data-* 
       claseOpcion,                       // clase CSS de los botones
       clave(item),                       // identificador corto
       etiqueta(item),                    // texto para aria-label
       textoObjetivo(item),               // texto escrito bajo el dibujo
       pintarOpcion(boton, item),         // cómo se ve cada opción
       pintarObjetivo(elemento, item),    // cómo se ve lo grande
       frase(item),                       // lo que dice la voz en la ronda
       refuerzo(item),                    // lo que dice al acertar
       animo, animoVisual,                // frases al fallar  (opcionales)
       acierto, aciertoVisual,            // frases al acertar (opcionales)
       sonidos,                           // true → tonos cortos del navegador
       sonidoDelItem(item)                // sonido propio del elemento (opcional)
     }
     Tanto las frases como animo/acierto pueden ser un texto fijo o una
     función que recibe el elemento objetivo (para decir su nombre). */
  function crearJuegoDeOpciones(cfg) {

    /* ---------- estado ---------- */
    let aciertos  = 0;
    let objetivo  = null;
    let jugando   = false;
    let esperando = false;      // true mientras se celebra un acierto
    let preparado = false;
    let temporizadores    = [];
    let temporizadorAviso = null;

    const el = {};              // elementos del DOM del juego

    /* ---------- utilidades ---------- */
    function alAzar(max) {
      return Math.floor(Math.random() * max);
    }

    /* Mezcla una lista (Fisher-Yates) para que el orden sea aleatorio */
    function mezclar(lista) {
      const copia = lista.slice();
      for (let i = copia.length - 1; i > 0; i--) {
        const j = alAzar(i + 1);
        const guardado = copia[i];
        copia[i] = copia[j];
        copia[j] = guardado;
      }
      return copia;
    }

    /* setTimeout que queda registrado para poder cancelarlo */
    function masTarde(fn, ms) {
      const id = setTimeout(fn, ms);
      temporizadores.push(id);
      return id;
    }

    function limpiarTiempos() {
      temporizadores.forEach(id => clearTimeout(id));
      temporizadores = [];

      if (temporizadorAviso !== null) {
        clearTimeout(temporizadorAviso);
        temporizadorAviso = null;
      }
    }

    /* Frase configurable: texto fijo o función del objetivo y, cuando
       hace falta, también de la opción que se tocó. */
    function fraseDe(fuente, porDefecto, opcion) {
      const valor = (typeof fuente === "function")
        ? fuente(objetivo, opcion)
        : (fuente || porDefecto);

      return (typeof valor === "function") ? valor(objetivo, opcion) : valor;
    }

    /* ¿Es la opción correcta? Por defecto, la que coincide con el
       objetivo. Los juegos de relación (¿dónde vive?, colores y
       objetos) pueden dar su propia regla. */
    function esAcierto(item, objetivoActual) {
      if (typeof cfg.esCorrecta === "function") {
        return !!cfg.esCorrecta(item, objetivoActual);
      }
      return cfg.clave(item) === cfg.clave(objetivoActual);
    }

    /* ---------- aviso amable ---------- */
    function mostrarAviso(texto, esAnimo, duracion) {
      if (!el.aviso) return;

      el.aviso.textContent = texto;
      el.aviso.classList.toggle("animo", !!esAnimo);
      el.aviso.classList.add("visible");

      if (temporizadorAviso !== null) clearTimeout(temporizadorAviso);
      temporizadorAviso = setTimeout(() => {
        el.aviso.classList.remove("visible");
      }, duracion || 2000);
    }

    function ocultarAviso() {
      if (!el.aviso) return;
      el.aviso.classList.remove("visible", "animo");
      el.aviso.textContent = "";
    }

    /* ---------- marcador de aciertos ---------- */
    function pintarMarcador() {
      if (!el.marcador) return;
      el.marcador.textContent = String(aciertos);

      const caja = el.marcador.closest(".marcador");
      if (caja) {
        caja.classList.remove("crece");
        void caja.offsetWidth;          // reinicia la animación
        caja.classList.add("crece");
      }
    }

    /* ---------- voz ---------- */
    function decirObjetivo() {
      if (!objetivo) return;

      /* Algunos juegos, al tocar lo grande, hacen otra cosa: repetir el
         sonido del animal, decir el nombre de la letra... */
      if (typeof cfg.alTocarObjetivo === "function") cfg.alTocarObjetivo(objetivo);

      /* Y algunos tienen su propia frase para lo grande (por ejemplo
         "Esta es la A." en vez de la pregunta). */
      if (typeof cfg.fraseObjetivo === "function") {
        hablar(cfg.fraseObjetivo(objetivo), "pregunta");
        return;
      }

      hablar(cfg.frase(objetivo), "pregunta");
    }

    /* ---------- construcción de la ronda ---------- */
    function crearBoton(item) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = cfg.claseOpcion;
      boton.dataset[cfg.dato] = cfg.clave(item);
      boton.setAttribute("aria-label", cfg.etiqueta(item));
      cfg.pintarOpcion(boton, item);
      boton.addEventListener("click", () => alTocarOpcion(boton, item));
      return boton;
    }

    function nuevaRonda() {
      if (!jugando) return;

      /* Cuántas alternativas tiene esta ronda (Conceptos pide 2) */
      const cuantas = cfg.opciones || OPCIONES_POR_RONDA;

      esperando = false;
      el.opciones.classList.remove("bloqueadas");
      el.opciones.innerHTML = "";
      el.fiesta.innerHTML = "";
      ocultarAviso();

      // El objetivo nunca se repite dos veces seguidas
      const candidatos = cfg.items.filter(
        item => !objetivo || cfg.clave(item) !== cfg.clave(objetivo)
      );
      objetivo = candidatos[alAzar(candidatos.length)];

      /* Las opciones de la ronda. En los juegos de relación (buscar algo
         rojo, ¿dónde vive?) la correcta NO es el objetivo: es un elemento
         del otro grupo que cumple la regla. En los demás, la correcta es
         el propio objetivo. */
      let deLaRonda;

      if (cfg.companeros) {
        /* Opciones emparejadas (Conceptos: arriba con abajo, uno con muchos) */
        const pareja = cfg.companeros(objetivo)
          .filter(item => cfg.clave(item) !== cfg.clave(objetivo))
          .slice(0, cuantas - 1);
        deLaRonda = [objetivo].concat(pareja);
      } else if (cfg.itemsOpciones) {
        const correctas = cfg.itemsOpciones.filter(item => esAcierto(item, objetivo));
        const elegida = correctas[alAzar(correctas.length)] || cfg.itemsOpciones[0];
        const distractores = mezclar(cfg.itemsOpciones.filter(item =>
          cfg.clave(item) !== cfg.clave(elegida) && !esAcierto(item, objetivo)
        )).slice(0, cuantas - 1);
        deLaRonda = [elegida].concat(distractores);
      } else {
        // Las otras opciones son distintas entre sí y distintas del objetivo
        const otros = mezclar(
          cfg.items.filter(item => cfg.clave(item) !== cfg.clave(objetivo))
        ).slice(0, cuantas - 1);
        deLaRonda = [objetivo].concat(otros);
      }

      // Mezclamos para que la respuesta correcta caiga en cualquier posición
      mezclar(deLaRonda).forEach(item => el.opciones.appendChild(crearBoton(item)));

      // Lo grande y su texto escrito
      cfg.pintarObjetivo(el.objetivo, objetivo);
      el.nombre.textContent = cfg.textoObjetivo(objetivo);

      // Reiniciamos la animación de aparición
      el.objetivo.classList.remove("aparece");
      void el.objetivo.offsetWidth;
      el.objetivo.classList.add("aparece");

      decirObjetivo();
      /* Algunos juegos suenan al empezar la ronda (¿qué sonido es?) */
      if (typeof cfg.sonidoDeRonda === "function") cfg.sonidoDeRonda(objetivo);
    }

    /* ---------- respuestas del niño ---------- */
    function alTocarOpcion(boton, item) {
      if (!jugando || esperando) return;

      if (esAcierto(item, objetivo)) {
        felicitar(boton, item);
      } else {
        darAnimo(boton);
      }
    }

    /* Respuesta equivocada: amable y sin palabras negativas.
       Cambiar la frase: cfg.animo / cfg.animoVisual (texto o función). */
    function darAnimo(boton) {
      boton.classList.remove("intento");
      void boton.offsetWidth;
      boton.classList.add("intento");
      masTarde(() => boton.classList.remove("intento"), 700);

      mostrarAviso(fraseDe(cfg.animoVisual, mensajes().animoVisual), true);
      hablar(fraseDe(cfg.animo, mensajes().animo), "animo");
      if (cfg.sonidos) sonarTono(TONOS.animo);
      // El botón sigue disponible y la ronda no cambia: puede reintentarlo
    }

    /* Respuesta correcta: celebración + siguiente ronda.
       Cambiar la frase: cfg.acierto / cfg.aciertoVisual (texto o función). */
    function felicitar(boton, item) {
      esperando = true;
      aciertos++;
      pintarMarcador();

      boton.classList.add("acierto");
      el.opciones.classList.add("bloqueadas");   // evita toques durante la fiesta

      lanzarEstrellas();
      mostrarAviso(fraseDe(cfg.aciertoVisual, mensajes().aciertoVisual, item), false, 2600);
      hablar(fraseDe(cfg.acierto, mensajes().acierto, item), "alegre");   // fiesta

      if (cfg.sonidos) sonarTono(TONOS.acierto);
      if (cfg.sonidoDelItem) cfg.sonidoDelItem(objetivo);

      // Reforzamos lo aprendido y, un momento después, otra ronda
      masTarde(() => hablar(cfg.refuerzo(objetivo, item), "alegre"), 1500);
      masTarde(() => nuevaRonda(), 2800);
    }

    function lanzarEstrellas() {
      const iconos = ["⭐", "🌟", "✨", "🎉", "💫"];

      for (let i = 0; i < 10; i++) {
        const estrella = document.createElement("span");
        estrella.className = "estrella";
        estrella.textContent = iconos[alAzar(iconos.length)];
        estrella.style.left   = (6 + Math.random() * 84).toFixed(1) + "%";
        estrella.style.bottom = (8 + Math.random() * 30).toFixed(1) + "%";
        estrella.style.animationDelay = (Math.random() * 0.35).toFixed(2) + "s";
        el.fiesta.appendChild(estrella);
      }

      masTarde(() => { el.fiesta.innerHTML = ""; }, 1800);
    }

    /* ---------- encendido / apagado del juego ---------- */
    function preparar() {
      if (preparado) return;

      el.opciones = document.getElementById(cfg.ids.opciones);
      el.objetivo = document.getElementById(cfg.ids.objetivo);
      el.nombre   = document.getElementById(cfg.ids.nombre);
      el.aviso    = document.getElementById(cfg.ids.aviso);
      el.fiesta   = document.getElementById(cfg.ids.fiesta);
      el.marcador = document.getElementById(cfg.ids.marcador);

      if (!el.opciones || !el.objetivo || !el.nombre) {
        console.warn(cfg.nombre + ": faltan elementos en el HTML.");
        return;
      }

      // Tocar lo grande repite la frase
      el.objetivo.addEventListener("click", decirObjetivo);

      preparado = true;
    }

    function iniciar() {
      preparar();
      if (!preparado) return;

      jugando  = true;
      objetivo = null;     // empezamos de cero cada vez que entra
      limpiarTiempos();
      pintarMarcador();
      nuevaRonda();
    }

    function detener() {
      jugando   = false;
      esperando = false;
      limpiarTiempos();
      detenerVoz();

      if (el.opciones) {
        el.opciones.innerHTML = "";
        el.opciones.classList.remove("bloqueadas");
      }
      if (el.fiesta) el.fiesta.innerHTML = "";
      ocultarAviso();

      objetivo = null;
    }

    return { iniciar, detener };
  }

  /* =======================================================
     6. MÓDULO COLORES
     ======================================================= */
  /* Los 6 colores iniciales. Para agregar otro basta con sumar
     una línea aquí: el juego se adapta solo. */
  const COLORES = [
    { id: "rojo",     nombre: "Rojo",     hex: "#ff3b30", grupo: "primario" },
    { id: "azul",     nombre: "Azul",     hex: "#1e88e5", grupo: "primario" },
    { id: "amarillo", nombre: "Amarillo", hex: "#ffcf00", grupo: "primario" },
    { id: "verde",    nombre: "Verde",    hex: "#34c759", grupo: "secundario" },
    { id: "naranjo",  nombre: "Naranjo",  hex: "#ff8a00", grupo: "secundario" },
    { id: "morado",   nombre: "Morado",   hex: "#a45cff", grupo: "secundario" },
    { id: "rosado",   nombre: "Rosado",   hex: "#ff8fb1", grupo: "otro" },
    { id: "cafe",     nombre: "Café",     hex: "#8b5a2b", grupo: "otro" },
    { id: "negro",    nombre: "Negro",    hex: "#1c1c22", grupo: "otro" },
    { id: "blanco",   nombre: "Blanco",   hex: "#ffffff", grupo: "otro" },
    { id: "gris",     nombre: "Gris",     hex: "#9aa0a6", grupo: "otro" },
    { id: "celeste",  nombre: "Celeste",  hex: "#7fd3f7", grupo: "otro" },
    { id: "beige",    nombre: "Beige",    hex: "#f0dfc0", grupo: "otro" },
    { id: "fucsia",   nombre: "Fucsia",   hex: "#ff2fd0", grupo: "otro" },
    { id: "violeta",  nombre: "Violeta",  hex: "#7a3ff2", grupo: "terciario" },
    { id: "turquesa", nombre: "Turquesa", hex: "#21c7c7", grupo: "terciario" },
    { id: "dorado",   nombre: "Dorado",   hex: "#d4a017", grupo: "otro" },
    { id: "plateado", nombre: "Plateado", hex: "#c8cfd8", grupo: "otro" },
    { id: "lima",     nombre: "Lima",     hex: "#b6e21a", grupo: "terciario" },
    { id: "cian",     nombre: "Cian",     hex: "#00e5ff", grupo: "otro" },
  ];

  const juegoColores = crearJuegoDeOpciones({
    nombre: "Colores",
    ids: {
      opciones: "opciones-colores",
      objetivo: "color-objetivo",
      nombre:   "nombre-color",
      aviso:    "aviso-colores",
      fiesta:   "fiesta-colores",
      marcador: "marcador-aciertos"
    },
    items: COLORES,
    dato: "color",
    claseOpcion: "boton-color",
    clave:         color => color.id,
    etiqueta:      color => t("etiquetaColor") + " " + nombreDe(color, "color"),
    textoObjetivo: color => nombreDe(color, "color"),
    pintarOpcion:  (boton, color) => { boton.style.backgroundColor = color.hex; },
    pintarObjetivo: (elemento, color) => { elemento.style.backgroundColor = color.hex; },
    frase:         color => f(t("fraseColor"), { nombre: nombreDe(color, "color") }),
    refuerzo:      color => "Es el color " + color.nombre
  });

  /* =======================================================
     7. MÓDULO NÚMEROS (del 1 al 10)
     ======================================================= */
  const NUMEROS = [
    { valor: 1,  palabra: "Uno"    },
    { valor: 2,  palabra: "Dos"    },
    { valor: 3,  palabra: "Tres"   },
    { valor: 4,  palabra: "Cuatro" },
    { valor: 5,  palabra: "Cinco"  },
    { valor: 6,  palabra: "Seis"   },
    { valor: 7,  palabra: "Siete"  },
    { valor: 8,  palabra: "Ocho"   },
    { valor: 9,  palabra: "Nueve"  },
    { valor: 10, palabra: "Diez"   }
  ];

  const juegoNumeros = crearJuegoDeOpciones({
    nombre: "Números",
    ids: {
      opciones: "opciones-numeros",
      objetivo: "numero-objetivo",
      nombre:   "nombre-numero",
      aviso:    "aviso-numeros",
      fiesta:   "fiesta-numeros",
      marcador: "marcador-numeros"
    },
    items: NUMEROS,
    dato: "numero",
    claseOpcion: "boton-numero",
    clave:         numero => String(numero.valor),
    etiqueta:      numero => t("etiquetaNumero") + " " + numero.valor,
    textoObjetivo: numero => palabraDe(numero),
    pintarOpcion:  (boton, numero) => { boton.textContent = String(numero.valor); },
    pintarObjetivo: (elemento, numero) => {
      // El número gigante vive dentro de la tarjeta
      const grande = document.getElementById("numero-grande");
      if (grande) grande.textContent = String(numero.valor);
      elemento.dataset.numero = String(numero.valor);
    },
    frase:    numero => f(t("fraseNumero"), { palabra: palabraDe(numero) }),
    refuerzo: numero => "Es el número " + numero.palabra
  });

  /* =======================================================
     8. MÓDULO FORMAS (5 formas básicas)
     ======================================================= */
  /* 9 formas, dibujadas con CSS. Cada una tiene SU PROPIO COLOR (fijo),
     así el niño las reconoce por la forma y también por su color. */
  const FORMAS = [
    { id: "circulo",    nombre: "Círculo",    nombreEn: "Circle",    articulo: "el", clase: "forma-circulo",    color: "#ff4d4d" },
    { id: "cuadrado",   nombre: "Cuadrado",   nombreEn: "Square",    articulo: "el", clase: "forma-cuadrado",   color: "#3fa9f5" },
    { id: "triangulo",  nombre: "Triángulo",  nombreEn: "Triangle",  articulo: "el", clase: "forma-triangulo",  color: "#4cd964" },
    { id: "rectangulo", nombre: "Rectángulo", nombreEn: "Rectangle", articulo: "el", clase: "forma-rectangulo", color: "#ff8a3d" },
    { id: "estrella",   nombre: "Estrella",   nombreEn: "Star",      articulo: "la", clase: "forma-estrella",   color: "#ffcf3f" },
    { id: "corazon",    nombre: "Corazón",    nombreEn: "Heart",     articulo: "el", clase: "forma-corazon",    color: "#ff5f8f" },
    { id: "rombo",      nombre: "Rombo",      nombreEn: "Diamond",   articulo: "el", clase: "forma-rombo",      color: "#a56bff" },
    { id: "ovalo",      nombre: "Óvalo",      nombreEn: "Oval",      articulo: "el", clase: "forma-ovalo",      color: "#2ec4b6" },
    { id: "cruz",       nombre: "Cruz",       nombreEn: "Cross",     articulo: "la", clase: "forma-cruz",       color: "#a3e635" }
  ];

  /* Pinta una forma con su color (el color va en una variable CSS para
     que también lo usen las formas dibujadas con varias piezas). */
  function colorearForma(nodo, forma) {
    if (!nodo || !forma) return nodo;
    if (forma.color) nodo.style.setProperty("--color-forma", forma.color);
    return nodo;
  }

  const juegoFormas = crearJuegoDeOpciones({
    nombre: "Formas",
    ids: {
      opciones: "opciones-formas",
      objetivo: "forma-objetivo",
      nombre:   "nombre-forma",
      aviso:    "aviso-formas",
      fiesta:   "fiesta-formas",
      marcador: "marcador-formas"
    },
    items: FORMAS,
    dato: "forma",
    claseOpcion: "boton-forma",
    clave:         forma => forma.id,
    etiqueta:      forma => t("etiquetaForma") + " " + nombreDe(forma, "forma"),
    textoObjetivo: forma => nombreDe(forma, "forma"),
    pintarOpcion:  (boton, forma) => {
      // Cada opción lleva la forma dibujada dentro
      const dibujo = colorearForma(document.createElement("span"), forma);
      dibujo.className = "forma " + forma.clase;
      boton.appendChild(dibujo);
    },
    pintarObjetivo: (elemento, forma) => {
      const grande = document.getElementById("forma-grande");
      if (grande) {
        grande.className = "forma " + forma.clase;
        colorearForma(grande, forma);
      }
      elemento.dataset.forma = forma.id;
    },
    frase:    forma => f(t("fraseForma"), {
      nombre:    nombreDe(forma, "forma"),
      minuscula: nombreDe(forma, "forma").toLowerCase(),
      articulo:  articuloDe(forma)
    }),
    refuerzo: forma => "Es " + forma.articulo + " " + forma.nombre.toLowerCase() + "."
  });

  /* =======================================================
     9. MÓDULO CONTAR OBJETOS (cantidades del 1 al 5)
     ======================================================= */
  /* Las cantidades son los primeros números: del 1 al 5. */
  const CANTIDADES = NUMEROS.slice(0, 5);

  /* Los objetos que se cuentan son emojis: no hace falta ninguna
     imagen externa. Cada ronda usa uno de ellos, al azar. */
  const OBJETOS = ["🍎", "⭐", "🐟", "🚗"];

  

  const PREGUNTA_CONTAR = "¿Cuántos hay?";

  const juegoContar = crearJuegoDeOpciones({
    nombre: "Contar",
    ids: {
      opciones: "opciones-cantidad",
      objetivo: "cantidad-objetivo",
      nombre:   "nombre-cantidad",
      aviso:    "aviso-contar",
      fiesta:   "fiesta-contar",
      marcador: "marcador-contar"
    },
    items: CANTIDADES,
    dato: "cantidad",
    claseOpcion: "boton-cantidad",
    clave:         cantidad => String(cantidad.valor),
    etiqueta:      cantidad => t("etiquetaNumero") + " " + cantidad.valor,
    textoObjetivo: () => t("contar"),
    pintarOpcion:  (boton, cantidad) => { boton.textContent = String(cantidad.valor); },
    pintarObjetivo: (elemento, cantidad) => {
      // Pintamos tantos objetos como dice el número objetivo
      const caja = document.getElementById("objetos-cantidad");
      if (!caja) return;

      caja.innerHTML = "";
      elemento.dataset.cantidad = String(cantidad.valor);

      // Objeto distinto en cada ronda, elegido al azar
      const emoji = OBJETOS[Math.floor(Math.random() * OBJETOS.length)];

      for (let i = 0; i < cantidad.valor; i++) {
        const objeto = document.createElement("span");
        objeto.className = "objeto";
        objeto.textContent = emoji;
        objeto.setAttribute("aria-hidden", "true");
        caja.appendChild(objeto);
      }
    },
    frase:    () => t("contar"),
    refuerzo: cantidad => "Había " + cantidad.palabra.toLowerCase() + ".",
    // Al fallar, en este juego invitamos a contar otra vez
    animo:       "¡Vamos a contarlos otra vez!",
    animoVisual: () => t("mensajes").animoContarVisual,
    animo:       () => t("mensajes").animoContar,
  });

  /* =======================================================
     10. MÓDULO ANIMALES (25 animales)
     ======================================================= */
  /* Cada animal lleva:
       emoji    → el dibujo grande
       nombre   → el nombre escrito en las opciones
       articulo → "un" o "una", para decir "¡Muy bien! Es un perro."
       sonido   → nombre del archivo previsto en assets/sonidos/animales/ */
  const ANIMALES = [
    { id: "perro",       nombre: "Perro",       emoji: "🐶", articulo: "un",  sonido: "perro"       },
    { id: "gato",        nombre: "Gato",        emoji: "🐱", articulo: "un",  sonido: "gato"        },
    { id: "vaca",        nombre: "Vaca",        emoji: "🐮", articulo: "una", sonido: "vaca"        },
    { id: "cerdo",       nombre: "Cerdo",       emoji: "🐷", articulo: "un",  sonido: "cerdo"       },
    { id: "leon",        nombre: "León",        emoji: "🦁", articulo: "un",  sonido: "leon"        },
    { id: "elefante",    nombre: "Elefante",    emoji: "🐘", articulo: "un",  sonido: "elefante"    },
    { id: "rana",        nombre: "Rana",        emoji: "🐸", articulo: "una", sonido: "rana"        },
    { id: "mono",        nombre: "Mono",        emoji: "🐵", articulo: "un",  sonido: "mono"        },
    { id: "tigre",       nombre: "Tigre",       emoji: "🐯", articulo: "un",  sonido: "tigre"       },
    { id: "oso",         nombre: "Oso",         emoji: "🐻", articulo: "un",  sonido: "oso"         },
    { id: "panda",       nombre: "Panda",       emoji: "🐼", articulo: "un",  sonido: "panda"       },
    { id: "zorro",       nombre: "Zorro",       emoji: "🦊", articulo: "un",  sonido: "zorro"       },
    { id: "conejo",      nombre: "Conejo",      emoji: "🐰", articulo: "un",  sonido: "conejo"      },
    { id: "raton",       nombre: "Ratón",       emoji: "🐭", articulo: "un",  sonido: "raton"       },
    { id: "hamster",     nombre: "Hámster",     emoji: "🐹", articulo: "un",  sonido: "hamster"     },
    { id: "koala",       nombre: "Koala",       emoji: "🐨", articulo: "un",  sonido: "koala"       },
    { id: "jirafa",      nombre: "Jirafa",      emoji: "🦒", articulo: "una", sonido: "jirafa"      },
    { id: "cebra",       nombre: "Cebra",       emoji: "🦓", articulo: "una", sonido: "cebra"       },
    { id: "rinoceronte", nombre: "Rinoceronte", emoji: "🦏", articulo: "un",  sonido: "rinoceronte" },
    { id: "hipopotamo",  nombre: "Hipopótamo",  emoji: "🦛", articulo: "un",  sonido: "hipopotamo"  },
    { id: "cocodrilo",   nombre: "Cocodrilo",   emoji: "🐊", articulo: "un",  sonido: "cocodrilo"   },
    { id: "tortuga",     nombre: "Tortuga",     emoji: "🐢", articulo: "una", sonido: "tortuga"     },
    { id: "serpiente",   nombre: "Serpiente",   emoji: "🐍", articulo: "una", sonido: "serpiente"   },
    { id: "pinguino",    nombre: "Pingüino",    emoji: "🐧", articulo: "un",  sonido: "pinguino"    },
    { id: "buho",        nombre: "Búho",        emoji: "🦉", articulo: "un",  sonido: "buho"        },
    { id: "pato",        nombre: "Pato",        emoji: "🦆", articulo: "un",  sonido: "pato"        },
    { id: "oveja",       nombre: "Oveja",       emoji: "🐑", articulo: "una", sonido: "oveja"       },
    { id: "caballo",     nombre: "Caballo",     emoji: "🐴", articulo: "un",  sonido: "caballo"     }
  ];

  const PREGUNTA_ANIMALES = "¿Qué animal es?";

  const juegoAnimales = crearJuegoDeOpciones({
    nombre: "Animales",
    ids: {
      opciones: "opciones-animales",
      objetivo: "animal-objetivo",
      nombre:   "nombre-animal",
      aviso:    "aviso-animales",
      fiesta:   "fiesta-animales",
      marcador: "marcador-animales"
    },
    items: ANIMALES,
    dato: "animal",
    claseOpcion: "boton-animal",
    clave:         animal => animal.id,
    etiqueta:      animal => t("etiquetaAnimal") + " " + nombreDe(animal, "animal"),
    textoObjetivo: () => t("animales"),
    pintarOpcion:  (boton, animal) => {
      /* Cada opción lleva tres cosas bien separadas:
           [EMOJI]  [NOMBRE]  [🔊 Escuchar]
         La tarjeta entera es la respuesta; el botoncito de sonido de
         dentro solo reproduce el sonido del animal. */
      const dibujo = document.createElement("span");
      dibujo.className = "animal-emoji";
      dibujo.textContent = animal.emoji;
      dibujo.setAttribute("aria-hidden", "true");

      const nombre = document.createElement("span");
      nombre.className = "animal-nombre";
      nombre.textContent = animal.nombre;

      /* En JUGAR las alternativas NO llevan botón de sonido: el niño
         debe reconocer la respuesta por sí mismo (los sonidos están en
         la etapa APRENDER). */
      boton.append(dibujo, nombre);
    },
    pintarObjetivo: (elemento, animal) => {
      const grande = document.getElementById("animal-grande");
      if (grande) grande.textContent = animal.emoji;
      elemento.dataset.animal = animal.id;
    },
    frase: () => t("animales"),
    /* La celebración dice el nombre del animal:
       "¡Muy bien! Es un perro." / "¡Muy bien! Es una vaca." */
    acierto: animal => f(t("aciertoItem"), {
      articulo: articuloDe(animal),
      nombre:   nombreDe(animal, "animal").toLowerCase()
    }),
    /* Ya lo hemos dicho todo al celebrar: no repetimos nada después */
    refuerzo: () => "",
    /* Sin tonos artificiales: la voz dice el nombre del animal */
    sonidos: false
  });

  /* =======================================================
     10-bis. MÓDULO FRUTAS (20 frutas)
     ======================================================= */
  /* Mismas reglas que los demás módulos. Dos ayudas de voz:
       · El botón 🔊 ESCUCHAR bajo la pregunta dice el nombre de la
         fruta grande ("Manzana").
       · El botón 🔊 de cada opción dice el nombre de esa fruta.
     Ninguno de los dos responde: no cuentan como respuesta, no suben
     el contador y no cambian la ronda.

     id       → identificador corto
     nombre   → el nombre escrito en las opciones
     emoji    → el dibujo de la fruta (emoji: sin archivos de imagen)
     articulo → "un" o "una", para decir "¡Muy bien! Es una manzana." */
  const FRUTAS = [
    { id: "manzana",      nombre: "Manzana",       emoji: "🍎", articulo: "una" },
    { id: "manzanaverde", nombre: "Manzana verde", emoji: "🍏", articulo: "una" },
    { id: "platano",      nombre: "Plátano",       emoji: "🍌", articulo: "un"  },
    { id: "naranja",      nombre: "Naranja",       emoji: "🍊", articulo: "una" },
    { id: "frutilla",     nombre: "Frutilla",      emoji: "🍓", articulo: "una" },
    { id: "uva",          nombre: "Uva",           emoji: "🍇", articulo: "una" },
    { id: "sandia",       nombre: "Sandía",        emoji: "🍉", articulo: "una" },
    { id: "pina",         nombre: "Piña",          emoji: "🍍", articulo: "una" },
    { id: "mango",        nombre: "Mango",         emoji: "🥭", articulo: "un"  },
    { id: "durazno",      nombre: "Durazno",       emoji: "🍑", articulo: "un"  },
    { id: "pera",         nombre: "Pera",          emoji: "🍐", articulo: "una" },
    { id: "cereza",       nombre: "Cereza",        emoji: "🍒", articulo: "una" },
    { id: "kiwi",         nombre: "Kiwi",          emoji: "🥝", articulo: "un"  },
    { id: "limon",        nombre: "Limón",         emoji: "🍋", articulo: "un"  },
    { id: "coco",         nombre: "Coco",          emoji: "🥥", articulo: "un"  },
    { id: "melon",        nombre: "Melón",         emoji: "🍈", articulo: "un"  },
    { id: "arandano",     nombre: "Arándano",      emoji: "🫐", articulo: "un"  },
    { id: "tomate",       nombre: "Tomate",        emoji: "🍅", articulo: "un"  },
    { id: "palta",        nombre: "Palta",         emoji: "🥑", articulo: "una" },
    { id: "aceituna",     nombre: "Aceituna",      emoji: "🫒", articulo: "una" }
  ];

  const PREGUNTA_FRUTAS = "¿Qué fruta es?";

  const juegoFrutas = crearJuegoDeOpciones({
    nombre: "Frutas",
    ids: {
      opciones: "opciones-frutas",
      objetivo: "fruta-objetivo",
      nombre:   "nombre-fruta",
      aviso:    "aviso-frutas",
      fiesta:   "fiesta-frutas",
      marcador: "marcador-frutas"
    },
    items: FRUTAS,
    dato: "fruta",
    claseOpcion: "boton-fruta",
    clave:         fruta => fruta.id,
    etiqueta:      fruta => t("etiquetaFruta") + " " + nombreDe(fruta, "fruta"),
    textoObjetivo: () => t("frutas"),
    pintarOpcion:  (boton, fruta) => {
      /* Cada opción lleva tres cosas separadas:
           [EMOJI]  [NOMBRE]  [🔊 Escuchar]
         La tarjeta entera es la respuesta; el botón de dentro dice el
         nombre de esa fruta y NO responde a la pregunta. */
      const dibujo = document.createElement("span");
      dibujo.className = "fruta-emoji";
      dibujo.textContent = fruta.emoji;
      dibujo.setAttribute("aria-hidden", "true");

      const nombre = document.createElement("span");
      nombre.className = "fruta-nombre";
      nombre.textContent = fruta.nombre;

      /* En JUGAR las alternativas NO llevan botón de sonido (los
         nombres se escuchan en la etapa APRENDER). */
      boton.append(dibujo, nombre);
    },
    pintarObjetivo: (elemento, fruta) => {
      const grande = document.getElementById("fruta-grande");
      if (grande) grande.textContent = fruta.emoji;
      elemento.dataset.fruta = fruta.id;
    },
    frase: () => t("frutas"),
    /* Celebración con el nombre: "¡Muy bien! Es una manzana." */
    acierto: fruta => f(t("aciertoItem"), {
      articulo: articuloDe(fruta),
      nombre:   nombreDe(fruta, "fruta").toLowerCase()
    }),
    /* Ya lo hemos dicho todo al celebrar: no repetimos nada después */
    refuerzo: () => "",
    sonidos: true
  });


  /* =======================================================
     10-TER. MÓDULOS NUEVOS
     ======================================================= */
  /* Todos usan el MISMO motor de opciones y el MISMO sistema de idioma.
     Cada uno solo describe sus elementos, cómo se pintan y qué se dice:
     no hay lógica duplicada. */

  /* ---------- ayudantes compartidos ---------- */

  /* Lo que dice el botón 🔊 de una opción (algunos módulos tienen su
     propia frase: las vocales dicen "Esta es la A.") */
  function fraseEscuchar(item, modulo) {
    if (modulo === "vocal") return f(t("esVocal"), { nombre: nombreDe(item, modulo) });
    return nombreDe(item, modulo);
  }

  /* Pinta el dibujo de un elemento: emoji, letra, color o imagen local */
  function dibujarElemento(item, modulo, tipo) {
    if (tipo === "imagen") {
      const img = document.createElement("img");
      img.className = "dibujo-imagen";
      img.src = item.imagen;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      return img;
    }
    const span = document.createElement("span");
    if (tipo === "letra") {
      span.className = "dibujo-letra";
      span.textContent = item.emoji || item.nombre || "";
    } else if (tipo === "color") {
      span.className = "dibujo-color";
      span.style.backgroundColor = item.hex || "#ffffff";
    } else {
      span.className = "dibujo-emoji";
      span.textContent = item.emoji || "";
    }
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  /* Opción grande: [DIBUJO] [NOMBRE] [🔊]. Escuchar nunca responde:
     solo dice el nombre (o reproduce el sonido, si el elemento lo tiene). */
  function pintarOpcionNueva(boton, item, modulo, tipo, opciones) {
    /* En JUGAR las alternativas son silenciosas (nada de 🔊): si el niño
       pudiera oír cada opción, el sonido revelaría la respuesta. El nombre
       escrito también se puede ocultar (¿qué sonido es? no lo muestra). */
    const mostrarSonido = !opciones || opciones.sonido === true;
    const mostrarNombre = !opciones || opciones.nombre !== false;

    const partes = [dibujarElemento(item, modulo, tipo)];

    if (mostrarNombre) {
      const nombre = document.createElement("span");
      nombre.className = "opcion-nombre";
      nombre.textContent = nombreDe(item, modulo);
      partes.push(nombre);
    }

    if (mostrarSonido) {
      const sonido = document.createElement("span");
      sonido.className = "opcion-sonido";
      sonido.setAttribute("role", "button");
      sonido.setAttribute("tabindex", "0");
      sonido.setAttribute("aria-label", t("escucharNombre") + ": " + nombreDe(item, modulo));

      const icono = document.createElement("span");
      icono.className = "sonido-icono";
      icono.textContent = "🔊";
      icono.setAttribute("aria-hidden", "true");

      const texto = document.createElement("span");
      texto.className = "sonido-texto";
      texto.textContent = t("escuchar");
      texto.setAttribute("aria-hidden", "true");

      sonido.append(icono, texto);

      const pulsarSonido = evento => {
        if (evento && evento.preventDefault) evento.preventDefault();
        if (evento && evento.stopPropagation) evento.stopPropagation();
        if (typeof item.sonarAnimal === "function") item.sonarAnimal();   // sonido real
        else hablar(fraseEscuchar(item, modulo), "normal");
      };

      sonido.addEventListener("click", pulsarSonido);
      sonido.addEventListener("keydown", evento => {
        if (evento.key === "Enter" || evento.key === " ") pulsarSonido(evento);
      });

      partes.push(sonido);
    }

    boton.append.apply(boton, partes);
  }

  /* Pinta lo grande del módulo */
  function pintarGrandeNueva(elemento, item, modulo, tipo, idGrande) {
    const grande = document.getElementById(idGrande);
    if (!grande) return;

    if (tipo === "imagen") {
      grande.src = item.imagen;
      grande.alt = nombreDe(item, modulo);
    } else if (tipo === "imagen-oculta") {
      // lo grande es un icono (los conceptos muestran una flecha, no la imagen)
      grande.textContent = item.icono || "❓";
    } else {
      grande.textContent = item.emoji || nombreDe(item, modulo);
    }
    elemento.dataset.elemento = item.id;
  }

  /* Fábrica de un juego "normal" de los módulos nuevos: siempre el mismo
     patrón (3 opciones, 1 correcta, 🔊, contador propio). */
  function crearJuegoNuevo(cfg) {
    const modulo = cfg.modulo;
    const tipo   = cfg.tipo || "emoji";

    return crearJuegoDeOpciones({
      nombre: cfg.tituloInterno || cfg.modulo,
      ids: {
        opciones: "opciones-" + modulo,
        objetivo: modulo + "-objetivo",
        nombre:   "nombre-" + modulo,
        aviso:    "aviso-" + modulo,
        fiesta:   "fiesta-" + modulo,
        marcador: "marcador-" + modulo
      },
      items:         cfg.items,
      itemsOpciones: cfg.itemsOpciones,
      opciones:      cfg.opciones,        // nº de alternativas (Conceptos: 2)
      companeros:    cfg.companeros,      // opciones emparejadas (arriba con abajo)
      dato:          "elemento",
      claseOpcion:   "boton-nuevo boton-" + modulo,
      clave:         item => item.id,
      esCorrecta:    cfg.esCorrecta,
      etiqueta:      item => {
        let clave = cfg.etiquetaClave;
        if (typeof clave === "function") return clave(item);
        if (item && item.color) clave = "etiquetaObjeto";        // colores y objetos
        if (item && item.lugar) clave = "etiquetaLugar";         // ¿dónde vive?
        return t(clave) + " " + nombreDe(item, cfg.moduloNombre || modulo);
      },
      textoObjetivo: cfg.textoObjetivo || (() => t(cfg.pregunta)),
      pintarOpcion:  (boton, item) => pintarOpcionNueva(boton, item, cfg.moduloNombre || modulo,
                                                        cfg.tipoOpcion || tipo,
                                                        { sonido: cfg.sonidoEnOpciones === true,
                                                          nombre: cfg.nombreEnOpciones !== false }),
      pintarObjetivo: (elemento, item) => {
        if (cfg.pintarGrande) cfg.pintarGrande(elemento, item);
        else pintarGrandeNueva(elemento, item, cfg.moduloNombre || modulo, tipo, modulo + "-grande");
        elemento.dataset.elemento = item.id;
      },
      frase:          cfg.frase || (() => t(cfg.pregunta)),
      fraseObjetivo:  cfg.fraseObjetivo,
      alTocarObjetivo: cfg.alTocarObjetivo,
      sonidoDeRonda:  cfg.sonidoDeRonda,
      acierto:        cfg.acierto,
      refuerzo:       cfg.refuerzo || (() => ""),
      sonidos:        cfg.sonidos !== false,
      sonidoDelItem:  cfg.sonidoDelItem
    });
  }

  /* ---------- 1. VEHÍCULOS (20) ---------- */
  const VEHICULOS = [
    { id: "auto",           nombre: "Auto",               nombreEn: "Car",           emoji: "🚗", articulo: "un"  },
    { id: "autobus",        nombre: "Autobús",            nombreEn: "Bus",           emoji: "🚌", articulo: "un"  },
    { id: "ambulancia",     nombre: "Ambulancia",         nombreEn: "Ambulance",     emoji: "🚑", articulo: "una" },
    { id: "camionbomberos", nombre: "Camión de bomberos", nombreEn: "Fire truck",    emoji: "🚒", articulo: "un"  },
    { id: "patrulla",       nombre: "Patrulla",           nombreEn: "Police car",    emoji: "🚓", articulo: "una" },
    { id: "taxi",           nombre: "Taxi",               nombreEn: "Taxi",          emoji: "🚕", articulo: "un"  },
    { id: "camion",         nombre: "Camión",             nombreEn: "Truck",         emoji: "🚚", articulo: "un"  },
    { id: "tractor",        nombre: "Tractor",            nombreEn: "Tractor",       emoji: "🚜", articulo: "un"  },
    { id: "moto",           nombre: "Moto",               nombreEn: "Motorcycle",    emoji: "🏍️", articulo: "una" },
    { id: "bicicleta",      nombre: "Bicicleta",          nombreEn: "Bicycle",       emoji: "🚲", articulo: "una" },
    { id: "helicoptero",    nombre: "Helicóptero",        nombreEn: "Helicopter",    emoji: "🚁", articulo: "un"  },
    { id: "avion",          nombre: "Avión",              nombreEn: "Airplane",      emoji: "✈️", articulo: "un"  },
    { id: "cohete",         nombre: "Cohete",             nombreEn: "Rocket",        emoji: "🚀", articulo: "un"  },
    { id: "barco",          nombre: "Barco",              nombreEn: "Ship",          emoji: "🚢", articulo: "un"  },
    { id: "velero",         nombre: "Velero",             nombreEn: "Sailboat",      emoji: "⛵", articulo: "un"  },
    { id: "tren",           nombre: "Tren",               nombreEn: "Train",         emoji: "🚂", articulo: "un"  },
    { id: "metro",          nombre: "Metro",              nombreEn: "Subway",        emoji: "🚇", articulo: "un"  },
    { id: "trolebus",       nombre: "Trolebús",           nombreEn: "Trolleybus",    emoji: "🚎", articulo: "un"  },
    { id: "furgoneta",      nombre: "Furgoneta",          nombreEn: "Van",           emoji: "🚐", articulo: "una" },
    { id: "camiongrande",   nombre: "Camión grande",      nombreEn: "Large truck",   emoji: "🚛", articulo: "un"  }
  ];

  const juegoVehiculos = crearJuegoNuevo({
    modulo: "vehiculos", moduloNombre: "vehiculo", tituloInterno: "Vehículos",
    items: VEHICULOS, pregunta: "vehiculos", etiquetaClave: "etiquetaVehiculo",
    acierto: item => f(t("aciertoItem"), {
      articulo: articuloDe(item), nombre: nombreDe(item, "vehiculo").toLowerCase()
    })
  });

  /* ---------- 2. PARTES DEL CUERPO (20, con ilustraciones) ---------- */
  const CUERPO = [
    { id: "ojitos",  nombre: "Ojos",    nombreEn: "Eyes",   imagen: "assets/imagenes/cuerpo/ojitos.svg"  },
    { id: "orejas",  nombre: "Orejas",  nombreEn: "Ears",   imagen: "assets/imagenes/cuerpo/orejas.svg"  },
    { id: "nariz",   nombre: "Nariz",   nombreEn: "Nose",   imagen: "assets/imagenes/cuerpo/nariz.svg"   },
    { id: "boca",    nombre: "Boca",    nombreEn: "Mouth",  imagen: "assets/imagenes/cuerpo/boca.svg"    },
    { id: "dientes", nombre: "Dientes", nombreEn: "Teeth",  imagen: "assets/imagenes/cuerpo/dientes.svg" },
    { id: "lengua",  nombre: "Lengua",  nombreEn: "Tongue", imagen: "assets/imagenes/cuerpo/lengua.svg"  },
    { id: "pelo",    nombre: "Pelo",    nombreEn: "Hair",   imagen: "assets/imagenes/cuerpo/pelo.svg"    },
    { id: "cara",    nombre: "Cara",    nombreEn: "Face",   imagen: "assets/imagenes/cuerpo/cara.svg"    },
    { id: "cabeza",  nombre: "Cabeza",  nombreEn: "Head",   imagen: "assets/imagenes/cuerpo/cabeza.svg"  },
    { id: "mano",    nombre: "Mano",    nombreEn: "Hand",   imagen: "assets/imagenes/cuerpo/mano.svg"    },
    { id: "brazo",   nombre: "Brazo",   nombreEn: "Arm",    imagen: "assets/imagenes/cuerpo/brazo.svg"   },
    { id: "pierna",  nombre: "Pierna",  nombreEn: "Leg",    imagen: "assets/imagenes/cuerpo/pierna.svg"  },
    { id: "pie",     nombre: "Pie",     nombreEn: "Foot",   imagen: "assets/imagenes/cuerpo/pie.svg"     },
    { id: "dedo",    nombre: "Dedo",    nombreEn: "Finger", imagen: "assets/imagenes/cuerpo/dedo.svg"    },
    { id: "pulgar",  nombre: "Pulgar",  nombreEn: "Thumb",  imagen: "assets/imagenes/cuerpo/pulgar.svg"  },
    { id: "rodilla", nombre: "Rodilla", nombreEn: "Knee",   imagen: "assets/imagenes/cuerpo/rodilla.svg" },
    { id: "corazon", nombre: "Corazón", nombreEn: "Heart",  imagen: "assets/imagenes/cuerpo/corazon.svg" },
    { id: "hueso",   nombre: "Hueso",   nombreEn: "Bone",   imagen: "assets/imagenes/cuerpo/hueso.svg"   },
    { id: "pulmones",nombre: "Pulmones",nombreEn: "Lungs",  imagen: "assets/imagenes/cuerpo/pulmones.svg"},
    { id: "codo",    nombre: "Codo",    nombreEn: "Elbow",  imagen: "assets/imagenes/cuerpo/codo.svg"    }
  ];

  const juegoCuerpo = crearJuegoNuevo({
    modulo: "cuerpo", moduloNombre: "cuerpo", tituloInterno: "Cuerpo",
    items: CUERPO, pregunta: "cuerpo", etiquetaClave: "etiquetaCuerpo",
    tipo: "imagen"
  });

  /* ---------- 3. VOCALES (5) ---------- */
  /* Cada vocal se muestra con mayúscula y minúscula juntas ("Aa").
     El nombre sigue siendo la letra sola ("A") para que la voz diga
     "Esta es la A." y no deletree. */
  /* El nombre va en minúscula ("a") a propósito: es lo que recibe la voz.
     Si se le pasa la letra suelta en mayúscula ("A"), muchos sintetizadores
     la leen como "A mayúscula"; con la minúscula dicen "la a", natural. */
  const VOCALES = [
    { id: "a", nombre: "a", emoji: "Aa" },
    { id: "e", nombre: "e", emoji: "Ee" },
    { id: "i", nombre: "i", emoji: "Ii" },
    { id: "o", nombre: "o", emoji: "Oo" },
    { id: "u", nombre: "u", emoji: "Uu" }
  ];

  const juegoVocales = crearJuegoNuevo({
    modulo: "vocales", moduloNombre: "vocal", tituloInterno: "Vocales",
    items: VOCALES, pregunta: "vocales", etiquetaClave: "etiquetaVocal",
    tipo: "letra",
    /* Al tocar la letra grande dice "Esta es la A." / "This is A." */
    fraseObjetivo: vocal => f(t("esVocal"), { nombre: nombreDe(vocal, "vocal") }),
    acierto: vocal => f(t("aciertoVocal"), { nombre: nombreDe(vocal, "vocal") })
  });

  /* ---------- 4. ALIMENTOS (20) ---------- */
  const ALIMENTOS = [
    { id: "pan",          nombre: "Pan",         nombreEn: "Bread",     emoji: "🍞", articulo: "un"  },
    { id: "queso",        nombre: "Queso",       nombreEn: "Cheese",    emoji: "🧀", articulo: "un"  },
    { id: "huevo",        nombre: "Huevo",       nombreEn: "Egg",       emoji: "🥚", articulo: "un"  },
    { id: "pizza",        nombre: "Pizza",       nombreEn: "Pizza",     emoji: "🍕", articulo: "una" },
    { id: "hamburguesa",  nombre: "Hamburguesa", nombreEn: "Hamburger", emoji: "🍔", articulo: "una" },
    { id: "completo",     nombre: "Completo",    nombreEn: "Hot dog",   emoji: "🌭", articulo: "un"  },
    { id: "arroz",        nombre: "Arroz",       nombreEn: "Rice",      emoji: "🍚", articulo: "un"  },
    { id: "pasta",        nombre: "Pasta",       nombreEn: "Pasta",     emoji: "🍝", articulo: "una" },
    { id: "ensalada",     nombre: "Ensalada",    nombreEn: "Salad",     emoji: "🥗", articulo: "una" },
    { id: "zanahoria",    nombre: "Zanahoria",   nombreEn: "Carrot",    emoji: "🥕", articulo: "una" },
    { id: "papa",         nombre: "Papa",        nombreEn: "Potato",    emoji: "🥔", articulo: "una" },
    { id: "maiz",         nombre: "Maíz",        nombreEn: "Corn",      emoji: "🌽", articulo: "un"  },
    { id: "brocoli",      nombre: "Brócoli",     nombreEn: "Broccoli",  emoji: "🥦", articulo: "un"  },
    { id: "pollo",        nombre: "Pollo",       nombreEn: "Chicken",   emoji: "🍗", articulo: "un"  },
    { id: "carne",        nombre: "Carne",       nombreEn: "Meat",      emoji: "🥩", articulo: "una" },
    { id: "camaron",      nombre: "Camarón",     nombreEn: "Shrimp",    emoji: "🍤", articulo: "un"  },
    { id: "galleta",      nombre: "Galleta",     nombreEn: "Cookie",    emoji: "🍪", articulo: "una" },
    { id: "torta",        nombre: "Torta",       nombreEn: "Cake",      emoji: "🍰", articulo: "una" },
    { id: "helado",       nombre: "Helado",      nombreEn: "Ice cream", emoji: "🍦", articulo: "un"  },
    { id: "cabritas",     nombre: "Cabritas",    nombreEn: "Popcorn",   emoji: "🍿", plural: true    },
    { id: "leche",        nombre: "Leche",       nombreEn: "Milk",      emoji: "🥛", plural: true    },
    { id: "jugo",         nombre: "Jugo",        nombreEn: "Juice",     emoji: "🧃", plural: true    },
    { id: "sopa",         nombre: "Sopa",        nombreEn: "Soup",      emoji: "🥣", articulo: "una" },
    { id: "yogur",        nombre: "Yogur",       nombreEn: "Yoghurt",   emoji: "🍶", plural: true    }
  ];

  const juegoAlimentos = crearJuegoNuevo({
    modulo: "alimentos", moduloNombre: "alimento", tituloInterno: "Alimentos",
    items: ALIMENTOS, pregunta: "alimentos", etiquetaClave: "etiquetaAlimento",
    acierto: item => item.plural
      ? mensajes().acierto
      : f(t("aciertoItem"), {
          articulo: articuloDe(item), nombre: nombreDe(item, "alimento").toLowerCase()
        })
  });

  /* ---------- 5. OBJETOS DE LA CASA (20) ---------- */
  const CASA = [
    { id: "cama",       nombre: "Cama",                nombreEn: "Bed",           emoji: "🛏️" },
    { id: "silla",      nombre: "Silla",               nombreEn: "Chair",         emoji: "🪑" },
    { id: "sofa",       nombre: "Sofá",                nombreEn: "Sofa",          emoji: "🛋️" },
    { id: "puerta",     nombre: "Puerta",              nombreEn: "Door",          emoji: "🚪" },
    { id: "ventana",    nombre: "Ventana",             nombreEn: "Window",        emoji: "🪟" },
    { id: "lampara",    nombre: "Lámpara",             nombreEn: "Lamp",          emoji: "💡" },
    { id: "television", nombre: "Televisión",          nombreEn: "TV",            emoji: "📺" },
    { id: "escoba",     nombre: "Escoba",              nombreEn: "Broom",         emoji: "🧹" },
    { id: "juguete",    nombre: "Juguete",             nombreEn: "Toy",           emoji: "🧸" },
    { id: "cepillo",    nombre: "Cepillo de dientes",  nombreEn: "Toothbrush",    emoji: "🪥" },
    { id: "jabon",      nombre: "Jabón",               nombreEn: "Soap",          emoji: "🧼" },
    { id: "banera",     nombre: "Bañera",              nombreEn: "Bathtub",       emoji: "🛁" },
    { id: "ducha",      nombre: "Ducha",               nombreEn: "Shower",        emoji: "🚿" },
    { id: "plato",      nombre: "Plato",               nombreEn: "Plate",         emoji: "🍽️" },
    { id: "cuchara",    nombre: "Cuchara",             nombreEn: "Spoon",         emoji: "🥄" },
    { id: "tenedor",    nombre: "Tenedor",             nombreEn: "Fork",          emoji: "🍴" },
    { id: "balde",      nombre: "Balde",               nombreEn: "Bucket",        emoji: "🪣" },
    { id: "canasto",    nombre: "Canasto",             nombreEn: "Basket",        emoji: "🧺" },
    { id: "reloj",      nombre: "Reloj",               nombreEn: "Clock",         emoji: "⏰" },
    { id: "espejo",     nombre: "Espejo",              nombreEn: "Mirror",        emoji: "🪞" },
    { id: "mesa",       nombre: "Mesa",                nombreEn: "Table",          emoji: "🪵" },
    { id: "telefono",   nombre: "Teléfono",            nombreEn: "Phone",          emoji: "📱" },
    { id: "toalla",     nombre: "Toalla",              nombreEn: "Towel",          emoji: "🧖" }
  ];

  const juegoCasa = crearJuegoNuevo({
    modulo: "casa", moduloNombre: "casa", tituloInterno: "Casa",
    items: CASA, pregunta: "casa", etiquetaClave: "etiquetaCasa"
  });

  /* ---------- 6. FAMILIA (9) ---------- */
  const FAMILIA = [
    { id: "papa",   nombre: "Papá",   nombreEn: "Dad",     emoji: "👨",    articulo: "el" },
    { id: "mama",   nombre: "Mamá",   nombreEn: "Mom",     emoji: "👩",    articulo: "la" },
    { id: "bebe",   nombre: "Bebé",   nombreEn: "Baby",    emoji: "👶",    articulo: "el" },
    { id: "nino",   nombre: "Niño",   nombreEn: "Boy",     emoji: "👦",    articulo: "el" },
    { id: "nina",   nombre: "Niña",   nombreEn: "Girl",    emoji: "👧",    articulo: "la" },
    { id: "abuelo", nombre: "Abuelo", nombreEn: "Grandpa", emoji: "👴",    articulo: "el" },
    { id: "abuela", nombre: "Abuela", nombreEn: "Grandma", emoji: "👵",    articulo: "la" },
    { id: "tio",    nombre: "Tío",    nombreEn: "Uncle",   emoji: "🧔",    articulo: "el" },
    { id: "tia",    nombre: "Tía",    nombreEn: "Aunt",    emoji: "👩‍🦰", articulo: "la" }
  ];

  const juegoFamilia = crearJuegoNuevo({
    modulo: "familia", moduloNombre: "familia", tituloInterno: "Familia",
    items: FAMILIA, pregunta: "familia", etiquetaClave: "etiquetaFamilia",
    acierto: item => f(t("aciertoItem"), {
      articulo: articuloDe(item), nombre: nombreDe(item, "familia").toLowerCase()
    })
  });


  /* ---------- 7. COLORES Y OBJETOS ---------- */
  /* Objetos dibujados de verdad con SU color (SVG propios en
     assets/imagenes/objetos/): la asociación objeto + color es visual. */
  const OBJETOS_COLOR = [
    { id: "manzana",   nombre: "Manzana",   nombreEn: "Apple",    imagen: "assets/imagenes/objetos/manzana.svg",   color: "rojo",     articulo: "una" },
    { id: "auto",      nombre: "Auto",      nombreEn: "Car",      imagen: "assets/imagenes/objetos/auto.svg",      color: "rojo",     articulo: "un"  },
    { id: "platano",   nombre: "Plátano",   nombreEn: "Banana",   imagen: "assets/imagenes/objetos/platano.svg",   color: "amarillo", articulo: "un"  },
    { id: "casa",      nombre: "Casa",      nombreEn: "House",    imagen: "assets/imagenes/objetos/casa.svg",      color: "amarillo", articulo: "una" },
    { id: "pepino",    nombre: "Pepino",    nombreEn: "Cucumber", imagen: "assets/imagenes/objetos/pepino.svg",    color: "verde",    articulo: "un"  },
    { id: "naranja",   nombre: "Naranja",   nombreEn: "Orange",   imagen: "assets/imagenes/objetos/naranja.svg",   color: "naranjo",  articulo: "una" },
    { id: "zanahoria", nombre: "Zanahoria", nombreEn: "Carrot",   imagen: "assets/imagenes/objetos/zanahoria.svg", color: "naranjo",  articulo: "una" },
    { id: "arandano",  nombre: "Arándano",  nombreEn: "Blueberry",imagen: "assets/imagenes/objetos/arandano.svg",  color: "azul",     articulo: "un"  },
    { id: "pelota",    nombre: "Pelota",    nombreEn: "Ball",     imagen: "assets/imagenes/objetos/pelota.svg",    color: "azul",     articulo: "una" },
    { id: "uvas",      nombre: "Uvas",      nombreEn: "Grapes",   imagen: "assets/imagenes/objetos/uvas.svg",      color: "morado",   plural: true    },
    { id: "flor",      nombre: "Flor",      nombreEn: "Flower",   imagen: "assets/imagenes/objetos/flor.svg",      color: "rosado",   articulo: "una" },
    { id: "pez",       nombre: "Pez",       nombreEn: "Fish",     imagen: "assets/imagenes/objetos/pez.svg",       color: "celeste",  articulo: "un"  },
    { id: "corazon",   nombre: "Corazón",   nombreEn: "Heart",    imagen: "assets/imagenes/objetos/corazon.svg",   color: "rojo",     articulo: "un"  },
    { id: "sol",       nombre: "Sol",       nombreEn: "Sun",      imagen: "assets/imagenes/objetos/sol.svg",       color: "amarillo", articulo: "el"  },
    { id: "mar",       nombre: "Mar",       nombreEn: "Sea",      imagen: "assets/imagenes/objetos/mar.svg",       color: "azul",     articulo: "el"  },
    { id: "cielo",     nombre: "Cielo",     nombreEn: "Sky",      imagen: "assets/imagenes/objetos/cielo.svg",     color: "azul",     articulo: "el"  },
    { id: "hoja",      nombre: "Hoja",      nombreEn: "Leaf",     imagen: "assets/imagenes/objetos/hoja.svg",      color: "verde",    articulo: "una" },
    { id: "ranaverde", nombre: "Rana",      nombreEn: "Frog",     imagen: "assets/imagenes/objetos/rana.svg",      color: "verde",    articulo: "una" }
  ];

  /* Solo los colores que tienen objetos dibujados (rojo, amarillo, verde,
     naranjo, azul, morado, rosado y celeste) */
  const COLORES_CON_OBJETOS = COLORES.filter(
    color => OBJETOS_COLOR.some(objeto => objeto.color === color.id)
  );

  function colorDeObjeto(objeto) {
    return COLORES.find(color => color.id === objeto.color) || COLORES[0];
  }

  function nombreDelColor(color) {
    return nombreDe(color, "color").toLowerCase();
  }

  function objetoConArticulo(objeto) {
    return (articuloDe(objeto) + nombreDe(objeto, "objeto").toLowerCase()).trim();
  }

  /* =======================================================
     7-bis. JUEGO "COLORES Y OBJETOS": asociación en las DOS
     direcciones (objeto → color y color → objeto)
     ======================================================= */
  function crearJuegoColoresObjetos() {
    const el = {};
    let jugando = false, esperando = false, bloqueado = false;
    let aciertos = 0, objetivo = null, colorCorrecto = null, modalidad = "", ultimaModalidad = "";
    let tiempos = [];

    const alAzar = max => Math.floor(Math.random() * max);

    function mezclar(lista) {
      const copia = lista.slice();
      for (let i = copia.length - 1; i > 0; i--) {
        const j = alAzar(i + 1);
        const guardado = copia[i];
        copia[i] = copia[j];
        copia[j] = guardado;
      }
      return copia;
    }

    function masTarde(fn, ms) { tiempos.push(setTimeout(fn, ms)); }

    function limpiarTiempos() {
      tiempos.forEach(id => clearTimeout(id));
      tiempos = [];
    }

    function ocultarAviso() {
      if (!el.aviso) return;
      el.aviso.textContent = "";
      el.aviso.classList.remove("visible", "animo");
    }

    function estrellas() {
      if (!el.fiesta) return;
      el.fiesta.innerHTML = "";
      const iconos = ["⭐", "🌟", "✨", "🎉", "💫"];
      for (let i = 0; i < 10; i++) {
        const estrella = document.createElement("span");
        estrella.className = "estrella";
        estrella.textContent = iconos[alAzar(iconos.length)];
        estrella.style.left = (6 + Math.random() * 84).toFixed(1) + "%";
        estrella.style.bottom = (8 + Math.random() * 30).toFixed(1) + "%";
        el.fiesta.appendChild(estrella);
      }
      masTarde(() => { el.fiesta.innerHTML = ""; }, 1800);
    }

    /* ---------- las opciones (sin ningún botón de sonido) ---------- */

    function botonDeColor(color) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "boton-opcion-color";
      boton.dataset.color = color.id;
      boton.setAttribute("aria-label", t("etiquetaColor") + " " + nombreDe(color, "color"));

      const muestra = document.createElement("span");
      muestra.className = "muestra-color";
      muestra.style.backgroundColor = color.hex;
      muestra.setAttribute("aria-hidden", "true");

      const nombre = document.createElement("span");
      nombre.className = "opcion-nombre";
      nombre.textContent = nombreDe(color, "color");

      boton.append(muestra, nombre);
      boton.addEventListener("click", () => responder(color.id === colorCorrecto.id, boton));
      return boton;
    }

    function botonDeObjeto(objeto) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "boton-opcion-objeto";
      boton.dataset.objeto = objeto.id;
      boton.setAttribute("aria-label", t("etiquetaObjeto") + " " + nombreDe(objeto, "objeto"));

      const img = document.createElement("img");
      img.className = "dibujo-objeto";
      img.src = objeto.imagen;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");

      boton.appendChild(img);
      boton.addEventListener("click", () => responder(objeto.color === colorCorrecto.id, boton));
      return boton;
    }

    /* ---------- las rondas ---------- */

    /* A) OBJETO → COLOR: se ve el objeto y se pregunta de qué color es */
    function rondaObjetoAColor() {
      const candidatos = OBJETOS_COLOR.filter(objeto => !objetivo || objeto.id !== objetivo.id);
      objetivo = candidatos[alAzar(candidatos.length)];
      const color = colorDeObjeto(objetivo);
      colorCorrecto = color;

      el.grande.innerHTML = "";
      el.grande.className = "dibujo-grande dibujo-objeto-grande";
      /* El objeto va sobre NADA: sin el color que quedó de la ronda
         anterior (antes podía aparecer un fondo amarillo, rojo...) */
      el.grande.style.backgroundColor = "";
      const img = document.createElement("img");
      img.className = "dibujo-objeto";
      img.src = objetivo.imagen;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      el.grande.appendChild(img);

      /* La pregunta nombra EL MISMO objeto que se ve: así nunca pueden
         desajustarse (antes decía solo "¿De qué color es?" y la frase de
         acierto nombraba el objeto: se podían mezclar). */
      const pregunta = f(t("preguntaDeQueColor"), { objeto: objetoConArticulo(objetivo) });
      el.nombre.textContent = pregunta;

      const otros = mezclar(COLORES_CON_OBJETOS.filter(c => c.id !== color.id)).slice(0, 2);
      mezclar([color].concat(otros)).forEach(c => el.opciones.appendChild(botonDeColor(c)));

      return pregunta;
    }

    /* B) COLOR → OBJETO: se ve el color y hay que encontrar el objeto */
    function rondaColorAObjeto() {
      const otrosColores = COLORES_CON_OBJETOS.filter(c => !colorCorrecto || c.id !== colorCorrecto.id);
      const color = otrosColores[alAzar(otrosColores.length)];
      colorCorrecto = color;

      const delColor = OBJETOS_COLOR.filter(objeto => objeto.color === color.id);
      objetivo = delColor[alAzar(delColor.length)];

      el.grande.innerHTML = "";
      el.grande.className = "dibujo-color-grande";
      el.grande.style.backgroundColor = color.hex;

      const pregunta = alAzar(2) === 0
        ? f(t("preguntaCualEs"), { color: nombreDelColor(color) })
        : f(t("preguntaBuscaObjeto"), { color: nombreDelColor(color) });
      el.nombre.textContent = pregunta;

      const correcto = delColor[alAzar(delColor.length)];
      const distintos = mezclar(OBJETOS_COLOR.filter(objeto => objeto.color !== color.id)).slice(0, 2);
      mezclar([correcto].concat(distintos)).forEach(o => el.opciones.appendChild(botonDeObjeto(o)));

      return pregunta;
    }

    function nuevaRonda() {
      if (!jugando) return;

      esperando = false;
      el.opciones.classList.remove("bloqueadas");
      el.opciones.innerHTML = "";
      el.fiesta.innerHTML = "";
      ocultarAviso();

      /* Se alternan las dos direcciones para que las dos aparezcan siempre */
      modalidad = alAzar(2) === 0 ? "objeto-color" : "color-objeto";
      if (modalidad === ultimaModalidad) {
        modalidad = modalidad === "objeto-color" ? "color-objeto" : "objeto-color";
      }
      ultimaModalidad = modalidad;

      const pregunta = modalidad === "objeto-color" ? rondaObjetoAColor() : rondaColorAObjeto();
      el.objetivo.dataset.elemento = objetivo.id;

      el.objetivo.classList.remove("aparece");
      void el.objetivo.offsetWidth;
      el.objetivo.classList.add("aparece");

      hablar(pregunta, "normal");
    }

    function responder(acierto, boton) {
      if (!jugando || esperando || bloqueado) return;

      if (!acierto) {
        /* Ánimo, sin palabras negativas y sin cambiar la pregunta */
        boton.classList.add("intento");
        masTarde(() => boton.classList.remove("intento"), 600);
        if (el.aviso) {
          el.aviso.textContent = mensajes().animoVisual;
          el.aviso.classList.add("visible", "animo");
        }
        hablar(mensajes().animo, "normal");
        return;
      }

      esperando = true;
      boton.classList.add("acierto");
      el.opciones.classList.add("bloqueadas");

      aciertos++;
      el.marcador.textContent = String(aciertos);

      if (el.aviso) {
        el.aviso.textContent = mensajes().aciertoVisual;
        el.aviso.classList.add("visible");
      }
      estrellas();
      sonarTono(TONOS.acierto);
      hablar(mensajes().acierto, "alegre");

      /* Después de acertar se dice la asociación completa */
      const frase = modalidad === "objeto-color"
        ? f(t("aciertoObjetoColor"), {
            objeto: objetoConArticulo(objetivo),
            color:  nombreDelColor(colorCorrecto)
          })
        : f(t("aciertoColorObjeto"), { objeto: objetoConArticulo(objetivo) });

      masTarde(() => {
        if (!jugando) return;
        hablar(frase, "alegre");
      }, 1200);

      /* 4,5 s: la voz termina de decir la frase de acierto ANTES de pasar
         a la ronda siguiente, así no se oye un objeto mientras se ve otro. */
      masTarde(() => { if (jugando) nuevaRonda(); }, 4500);
    }

    function preparar() {
      el.zona     = document.getElementById("zona-coloresobjetos");
      el.grande   = document.getElementById("coloresobjetos-grande");
      el.nombre   = document.getElementById("nombre-coloresobjetos");
      el.opciones = document.getElementById("opciones-coloresobjetos");
      el.aviso    = document.getElementById("aviso-coloresobjetos");
      el.fiesta   = document.getElementById("fiesta-coloresobjetos");
      el.marcador = document.getElementById("marcador-coloresobjetos");
      el.objetivo = document.getElementById("coloresobjetos-objetivo");
    }

    function iniciar() {
      preparar();
      if (!el.opciones) {
        console.warn("Colores y objetos: faltan elementos en el HTML.");
        return;
      }
      jugando = true;
      esperando = false;
      bloqueado = false;
      aciertos = 0;
      objetivo = null;
      colorCorrecto = null;
      ultimaModalidad = "";
      el.marcador.textContent = "0";
      el.grande.style.backgroundColor = "";
      nuevaRonda();
    }

    function detener() {
      jugando = false;
      esperando = false;
      bloqueado = false;
      limpiarTiempos();
      if (el.opciones) el.opciones.innerHTML = "";
      if (el.fiesta) el.fiesta.innerHTML = "";
      ocultarAviso();
    }

    return { iniciar, detener };
  }

  const juegoColoresObjetos = crearJuegoColoresObjetos();

  /* ---------- 8. ¿DÓNDE VIVE? (8 animales y 6 lugares) ---------- */
  const LUGARES = [
    { id: "mar",      nombre: "Mar",      nombreEn: "Sea",     emoji: "🌊", articulo: "el" },
    { id: "sabana",   nombre: "Sabana",   nombreEn: "Savanna", emoji: "🌿", articulo: "la" },
    { id: "hielo",    nombre: "Hielo",    nombreEn: "Ice",     emoji: "❄️", articulo: "el" },
    { id: "granja",   nombre: "Granja",   nombreEn: "Farm",    emoji: "🚜", articulo: "la" },
    { id: "selva",    nombre: "Selva",    nombreEn: "Jungle",  emoji: "🌳", articulo: "la" },
    { id: "desierto", nombre: "Desierto", nombreEn: "Desert",  emoji: "🏜️", articulo: "el" }
  ];

  const ANIMALES_LUGAR = [
    { id: "pez",      nombre: "Pez",      nombreEn: "Fish",     emoji: "🐟", lugar: "mar",      articulo: "el" },
    { id: "delfin",   nombre: "Delfín",   nombreEn: "Dolphin",  emoji: "🐬", lugar: "mar",      articulo: "el" },
    { id: "leon",     nombre: "León",     nombreEn: "Lion",     emoji: "🦁", lugar: "sabana",   articulo: "el" },
    { id: "elefante", nombre: "Elefante", nombreEn: "Elephant", emoji: "🐘", lugar: "sabana",   articulo: "el" },
    { id: "pinguino", nombre: "Pingüino", nombreEn: "Penguin",  emoji: "🐧", lugar: "hielo",    articulo: "el" },
    { id: "vaca",     nombre: "Vaca",     nombreEn: "Cow",      emoji: "🐄", lugar: "granja",   articulo: "la" },
    { id: "mono",     nombre: "Mono",     nombreEn: "Monkey",   emoji: "🐒", lugar: "selva",    articulo: "el" },
    { id: "camello",  nombre: "Camello",  nombreEn: "Camel",    emoji: "🐪", lugar: "desierto", articulo: "el" }
  ];

  const juegoDondeVive = crearJuegoNuevo({
    modulo: "dondevive", moduloNombre: "lugar", tituloInterno: "¿Dónde vive?",
    items: ANIMALES_LUGAR,          // lo grande es el animal
    itemsOpciones: LUGARES,         // las opciones son lugares
    pregunta: "dondeVive",
    etiquetaClave: item => (item.lugar ? t("etiquetaAnimal") : t("etiquetaLugar")),
    esCorrecta: (lugar, animal) => lugar.id === animal.lugar,
    acierto: () => mensajes().acierto,
    refuerzo: (animal, lugar) => f(t("refuerzoVive"), {
      artAnimal: articuloDe(animal),
      animal:    nombreDe(animal, "animal").toLowerCase(),
      artLugar:  articuloDe(lugar),
      lugar:     nombreDe(lugar, "lugar").toLowerCase()
    })
  });

  /* ---------- 9. ¿QUÉ SONIDO ES? (reutiliza los sonidos que ya hay) ---------- */
  /* Solo los animales que YA tienen su mp3 en assets/sonidos/:
     no se descarga ni se duplica ningún archivo. */
  const ANIMALES_CON_SONIDO = ANIMALES
    .filter(animal => SONIDOS_LISTOS.indexOf(animal.sonido) !== -1)
    .map(animal => Object.assign({}, animal, {
      sonarAnimal: () => sonarAnimal(animal)
    }));

  const juegoQueSonido = crearJuegoNuevo({
    modulo: "quesonido", moduloNombre: "animal", tituloInterno: "¿Qué sonido es?",
    items: ANIMALES_CON_SONIDO,
    pregunta: "queSonido",
    etiquetaClave: "etiquetaAnimal",
    tipo: "sonido",
    /* El nombre del animal NO se muestra antes de responder: el niño
       reconoce al animal por el sonido. Alternativas silenciosas. */
    nombreEnOpciones: false,
    sonidoEnOpciones: false,
    /* Lo grande es un altavoz: al tocarlo se repite el sonido de la ronda */
    pintarGrande: (elemento, animal) => {
      const grande = document.getElementById("quesonido-grande");
      if (grande) grande.textContent = "🔊";
      elemento.dataset.elemento = animal.id;
    },
    /* El sonido suena al empezar cada ronda y también al tocar el altavoz */
    sonidoDeRonda:   animal => sonarAnimal(animal),
    alTocarObjetivo: animal => sonarAnimal(animal),
    acierto: animal => f(t("aciertoItem"), {
      articulo: articuloDe(animal), nombre: nombreDe(animal, "animal").toLowerCase()
    }),
    refuerzo: animal => f(t("sonidoAnimal"), {
      animal: nombreDe(animal, "animal").toLowerCase()
    })
  });

  /* ---------- 10. MEMORIA (6 cartas = 3 parejas) ---------- */
  const PAREJAS_MEMORIA = [
    { id: "perro",   emoji: "🐶" }, { id: "gato",    emoji: "🐱" },
    { id: "manzana", emoji: "🍎" }, { id: "auto",    emoji: "🚗" },
    { id: "leon",    emoji: "🦁" }, { id: "estrella",emoji: "⭐" },
    { id: "flor",    emoji: "🌻" }, { id: "barco",   emoji: "🚢" },
    { id: "rana",    emoji: "🐸" }, { id: "helado",  emoji: "🍦" },
    { id: "cohete",  emoji: "🚀" }, { id: "sol",     emoji: "☀️" }
  ];

  /* Juego de memoria: 6 cartas ocultas, 3 parejas. Mismo estilo de
     celebración que los demás módulos, sin mensajes negativos. */
  function crearJuegoDeMemoria() {
    const el = {};
    let jugando = false, primera = null, bloqueado = false, parejas = 0, tiempos = [];

    /* Dificultad progresiva: se empieza con 3 parejas y se sube hasta 6 */
    const PAREJAS_INICIALES = 3, PAREJAS_MAXIMAS = 6;
    let nivelParejas = PAREJAS_INICIALES;
    let parejasDeLaPartida = PAREJAS_INICIALES;
    const TIEMPO_MIRAR = 2600;      // cuánto se ven las cartas al empezar

    const alAzar = max => Math.floor(Math.random() * max);

    function mezclar(lista) {
      const copia = lista.slice();
      for (let i = copia.length - 1; i > 0; i--) {
        const j = alAzar(i + 1);
        const guardado = copia[i];
        copia[i] = copia[j];
        copia[j] = guardado;
      }
      return copia;
    }

    function masTarde(fn, ms) { tiempos.push(setTimeout(fn, ms)); }

    function limpiarTiempos() {
      tiempos.forEach(t2 => clearTimeout(t2));
      tiempos = [];
    }

    function pintarMarcador() {
      if (el.marcador) el.marcador.textContent = String(parejas);
    }

    function ocultarAviso() {
      if (!el.aviso) return;
      el.aviso.textContent = "";
      el.aviso.classList.remove("visible", "animo");
    }

    function lanzarEstrellas() {
      if (!el.fiesta) return;
      el.fiesta.innerHTML = "";
      const iconos = ["⭐", "🌟", "✨", "🎉", "💫"];
      for (let i = 0; i < 10; i++) {
        const estrella = document.createElement("span");
        estrella.className = "estrella";
        estrella.textContent = iconos[alAzar(iconos.length)];
        estrella.style.left = (6 + Math.random() * 84).toFixed(1) + "%";
        estrella.style.bottom = (8 + Math.random() * 30).toFixed(1) + "%";
        estrella.style.animationDelay = (Math.random() * 0.35).toFixed(2) + "s";
        el.fiesta.appendChild(estrella);
      }
      masTarde(() => { el.fiesta.innerHTML = ""; }, 1800);
    }

    function nuevaPartida() {
      limpiarTiempos();
      primera = null;
      bloqueado = false;
      parejas = 0;
      pintarMarcador();
      ocultarAviso();
      if (el.fiesta) el.fiesta.innerHTML = "";

      /* Cada imagen aparece exactamente dos veces y las cartas se quedan
         siempre en la misma posición durante toda la partida. */
      parejasDeLaPartida = Math.min(nivelParejas, PAREJAS_MEMORIA.length);
      const elegidas = mezclar(PAREJAS_MEMORIA).slice(0, parejasDeLaPartida);
      const baraja = mezclar(elegidas.concat(elegidas));

      /* 3 columnas con 6 cartas; 4 columnas con 8 o 12 (cartas grandes) */
      if (el.tablero.style) {
        el.tablero.style.gridTemplateColumns =
          "repeat(" + (parejasDeLaPartida <= 3 ? 3 : 4) + ", 1fr)";
      }

      el.tablero.innerHTML = "";
      const repartidas = [];
      baraja.forEach((carta, i) => {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "carta-memoria";
        boton.dataset.pareja = carta.id;
        boton.dataset.indice = String(i);
        boton.textContent = "❓";
        boton.setAttribute("aria-label", t("tituloMemoria") + " " + (i + 1));
        boton.addEventListener("click", () => alTocarCarta(boton, carta));
        el.tablero.appendChild(boton);
        repartidas.push({ boton: boton, carta: carta });
      });

      /* Primero se enseñan todas un momento (el niño las mira) y luego se
         ocultan: hay que recordar dónde estaba cada dibujo. */
      bloqueado = true;
      repartidas.forEach(par => {
        par.boton.textContent = par.carta.emoji;
        par.boton.classList.add("volteada", "mirando");
      });
      if (el.aviso) {
        el.aviso.textContent = t("memoriaMirar");
        el.aviso.classList.add("visible");
      }
      masTarde(() => {
        if (!jugando) return;
        repartidas.forEach(par => {
          par.boton.textContent = "❓";
          par.boton.classList.remove("volteada", "mirando");
        });
        bloqueado = false;
        ocultarAviso();
      }, TIEMPO_MIRAR);
    }

    function alTocarCarta(boton, carta) {
      if (!jugando || bloqueado) return;      // mientras se miran, no se toca
      if (boton.classList.contains("volteada")) return;          // ya descubierta
      if (primera && primera.boton === boton) return;            // la misma carta

      boton.textContent = carta.emoji;
      boton.classList.add("volteada");

      if (!primera) {
        primera = { boton: boton, carta: carta };
        return;
      }

      if (primera.carta.id === carta.id) {
        // Pareja encontrada: se quedan visibles
        primera.boton.classList.add("pareja");
        boton.classList.add("pareja");
        primera = null;
        parejas++;
        pintarMarcador();
        hablar(mensajes().acierto, "alegre");
        sonarTono(TONOS.acierto);   // suena igual que en los demás módulos

        if (parejas === parejasDeLaPartida) {
          if (el.aviso) {
            el.aviso.textContent = t("aciertoMemoria");
            el.aviso.classList.add("visible");
          }
          lanzarEstrellas();
          hablar(t("aciertoMemoria"), "alegre");

          /* Al terminar sube un poco la dificultad para la próxima partida */
          nivelParejas = Math.min(PAREJAS_MAXIMAS, nivelParejas + 1);
          masTarde(() => nuevaPartida(), 3200);
        }
      } else {
        // No coinciden: se vuelven a ocultar un momento después
        bloqueado = true;
        const primeraCarta = primera.boton;
        primera = null;
        masTarde(() => {
          primeraCarta.textContent = "❓";
          primeraCarta.classList.remove("volteada");
          boton.textContent = "❓";
          boton.classList.remove("volteada");
          bloqueado = false;
        }, 900);
      }
    }

    function preparar() {
      el.tablero  = document.getElementById("tablero-memoria");
      el.marcador = document.getElementById("marcador-memoria");
      el.aviso    = document.getElementById("aviso-memoria");
      el.fiesta   = document.getElementById("fiesta-memoria");
    }

    function iniciar() {
      preparar();
      if (!el.tablero) {
        console.warn("Memoria: falta el tablero en el HTML.");
        return;
      }
      jugando = true;
      nuevaPartida();
    }

    function detener() {
      jugando = false;
      limpiarTiempos();
      primera = null;
      bloqueado = false;
      if (el.tablero) el.tablero.innerHTML = "";
      ocultarAviso();
      if (el.fiesta) el.fiesta.innerHTML = "";
    }

    return { iniciar, detener };
  }

  const juegoMemoria = crearJuegoDeMemoria();

  /* ---------- 11. CONCEPTOS Y POSICIONES (36, con ilustraciones) ---------- */
  /* Van por PAREJAS: la pregunta siempre enfrenta un concepto con su
     contrario (arriba/abajo, uno/muchos...), así la respuesta se resuelve
     mirando. Lo grande es el icono + la pregunta; las opciones son las
     ilustraciones de assets/imagenes/conceptos/ y son SOLO 2. */
  const CONCEPTOS = [
    { id: "arriba",    par: "abajo",     nombre: "Arriba",    nombreEn: "Up",        emoji: "⬆️", pregunta: "¿Cuál está arriba?",        preguntaEn: "Which one is up?" },
    { id: "abajo",     par: "arriba",    nombre: "Abajo",     nombreEn: "Down",      emoji: "⬇️", pregunta: "¿Cuál está abajo?",          preguntaEn: "Which one is down?" },
    { id: "izquierda", par: "derecha",   nombre: "Izquierda", nombreEn: "Left",      emoji: "⬅️", pregunta: "¿Cuál está a la izquierda?", preguntaEn: "Which one is on the left?" },
    { id: "derecha",   par: "izquierda", nombre: "Derecha",   nombreEn: "Right",     emoji: "➡️", pregunta: "¿Cuál está a la derecha?",   preguntaEn: "Which one is on the right?" },
    { id: "encima",    par: "debajo",    nombre: "Encima",    nombreEn: "On top",    emoji: "🧺", pregunta: "¿Cuál está encima?",         preguntaEn: "Which one is on top?" },
    { id: "debajo",    par: "encima",    nombre: "Debajo",    nombreEn: "Under",     emoji: "🧭", pregunta: "¿Cuál está debajo?",         preguntaEn: "Which one is underneath?" },
    { id: "dentro",    par: "fuera",     nombre: "Dentro",    nombreEn: "Inside",    emoji: "📥", pregunta: "¿Cuál está dentro?",         preguntaEn: "Which one is inside?" },
    { id: "fuera",     par: "dentro",    nombre: "Fuera",     nombreEn: "Outside",   emoji: "📤", pregunta: "¿Cuál está fuera?",          preguntaEn: "Which one is outside?" },
    { id: "cerca",     par: "lejos",     nombre: "Cerca",     nombreEn: "Near",      emoji: "🤝", pregunta: "¿Cuál está cerca?",          preguntaEn: "Which one is near?" },
    { id: "lejos",     par: "cerca",     nombre: "Lejos",     nombreEn: "Far",       emoji: "🔭", pregunta: "¿Cuál está lejos?",          preguntaEn: "Which one is far?" },
    { id: "grande",    par: "pequeno",   nombre: "Grande",    nombreEn: "Big",       emoji: "🐘", pregunta: "¿Cuál es grande?",           preguntaEn: "Which one is big?" },
    { id: "pequeno",   par: "grande",    nombre: "Pequeño",   nombreEn: "Small",     emoji: "🐭", pregunta: "¿Cuál es pequeño?",          preguntaEn: "Which one is small?" },
    { id: "alto",      par: "bajo",      nombre: "Alto",      nombreEn: "Tall",      emoji: "🏔️", pregunta: "¿Cuál es alto?",             preguntaEn: "Which one is tall?" },
    { id: "bajo",      par: "alto",      nombre: "Bajo",      nombreEn: "Short",     emoji: "📉", pregunta: "¿Cuál es bajo?",             preguntaEn: "Which one is short?" },
    { id: "largo",     par: "corto",     nombre: "Largo",     nombreEn: "Long",      emoji: "📏", pregunta: "¿Cuál es largo?",            preguntaEn: "Which one is long?" },
    { id: "corto",     par: "largo",     nombre: "Corto",     nombreEn: "Short",     emoji: "📐", pregunta: "¿Cuál es corto?",            preguntaEn: "Which one is short?" },
    { id: "lleno",     par: "vacio",     nombre: "Lleno",     nombreEn: "Full",      emoji: "🥤", pregunta: "¿Cuál está lleno?",          preguntaEn: "Which one is full?" },
    { id: "vacio",     par: "lleno",     nombre: "Vacío",     nombreEn: "Empty",     emoji: "🫙", pregunta: "¿Cuál está vacío?",          preguntaEn: "Which one is empty?" },
    { id: "abierto",   par: "cerrado",   nombre: "Abierto",   nombreEn: "Open",      emoji: "🔓", pregunta: "¿Cuál está abierto?",        preguntaEn: "Which one is open?" },
    { id: "cerrado",   par: "abierto",   nombre: "Cerrado",   nombreEn: "Closed",    emoji: "🔒", pregunta: "¿Cuál está cerrado?",        preguntaEn: "Which one is closed?" },
    { id: "encendido", par: "apagado",   nombre: "Encendido", nombreEn: "On",        emoji: "💡", pregunta: "¿Cuál está encendido?",      preguntaEn: "Which one is on?" },
    { id: "apagado",   par: "encendido", nombre: "Apagado",   nombreEn: "Off",       emoji: "🌑", pregunta: "¿Cuál está apagado?",        preguntaEn: "Which one is off?" },
    { id: "lento",     par: "rapido",    nombre: "Lento",     nombreEn: "Slow",      emoji: "🐌", pregunta: "¿Cuál va lento?",            preguntaEn: "Which one is slow?" },
    { id: "rapido",    par: "lento",     nombre: "Rápido",    nombreEn: "Fast",      emoji: "🏎️", pregunta: "¿Cuál va rápido?",           preguntaEn: "Which one is fast?" },
    { id: "adelante",  par: "atras",     nombre: "Adelante",  nombreEn: "Front",     emoji: "👀", pregunta: "¿Cuál está adelante?",       preguntaEn: "Which one is in front?" },
    { id: "atras",     par: "adelante",  nombre: "Atrás",     nombreEn: "Back",      emoji: "🔙", pregunta: "¿Cuál está atrás?",          preguntaEn: "Which one is behind?" },
    { id: "uno",       par: "muchos",    nombre: "Uno",       nombreEn: "One",       emoji: "1️⃣", pregunta: "¿Dónde hay uno solo?",       preguntaEn: "Where is there just one?" },
    { id: "muchos",    par: "uno",       nombre: "Muchos",    nombreEn: "Many",      emoji: "🔢", pregunta: "¿Dónde hay muchos?",         preguntaEn: "Where are there many?" },
    { id: "mas",       par: "menos",     nombre: "Más",       nombreEn: "More",      emoji: "➕", pregunta: "¿Dónde hay más?",            preguntaEn: "Where are there more?" },
    { id: "menos",     par: "mas",       nombre: "Menos",     nombreEn: "Fewer",     emoji: "➖", pregunta: "¿Dónde hay menos?",          preguntaEn: "Where are there fewer?" },
    { id: "primero",   par: "ultimo",    nombre: "Primero",   nombreEn: "First",     emoji: "🥇", pregunta: "¿Quién va primero?",         preguntaEn: "Who goes first?" },
    { id: "ultimo",    par: "primero",   nombre: "Último",    nombreEn: "Last",      emoji: "🏁", pregunta: "¿Quién va último?",          preguntaEn: "Who goes last?" },
    { id: "antes",     par: "despues",   nombre: "Antes",     nombreEn: "Before",    emoji: "⏮️", pregunta: "¿Qué pasa antes?",           preguntaEn: "What happens first?" },
    { id: "despues",   par: "antes",     nombre: "Después",   nombreEn: "After",     emoji: "⏭️", pregunta: "¿Qué pasa después?",         preguntaEn: "What happens after?" },
    { id: "pesado",    par: "liviano",   nombre: "Pesado",    nombreEn: "Heavy",     emoji: "⚖️", pregunta: "¿Cuál es pesado?",           preguntaEn: "Which one is heavy?" },
    { id: "liviano",   par: "pesado",    nombre: "Liviano",   nombreEn: "Light",     emoji: "🪶", pregunta: "¿Cuál es liviano?",          preguntaEn: "Which one is light?" }
  ];
  CONCEPTOS.forEach(concepto => {
    concepto.imagen = "assets/imagenes/conceptos/" + concepto.id + ".svg";
  });

  const juegoConceptos = crearJuegoNuevo({
    modulo: "conceptos", moduloNombre: "concepto", tituloInterno: "Conceptos",
    items: CONCEPTOS, pregunta: "conceptos", etiquetaClave: "etiquetaConcepto",
    tipo: "icono",
    tipoOpcion: "imagen",
    /* EXACTAMENTE 2 opciones: el concepto y su contrario */
    opciones: 2,
    companeros: item => CONCEPTOS.filter(concepto => concepto.par === item.id),
    etiqueta: item => t("etiquetaConcepto") + " " + nombreDe(item, "concepto"),
    textoObjetivo: item => (IDIOMA === "en" ? item.preguntaEn : item.pregunta),
    frase:         item => (IDIOMA === "en" ? item.preguntaEn : item.pregunta)
  });

  /* ---------- 12. EMOCIONES Y EXPRESIONES (12, con ilustraciones) ---------- */
  const EMOCIONES = [
    { id: "alegre",     nombre: "Alegre",     nombreEn: "Happy",     emoji: "😀" },
    { id: "triste",     nombre: "Triste",     nombreEn: "Sad",       emoji: "😢" },
    { id: "enojado",    nombre: "Enojado",    nombreEn: "Angry",     emoji: "😡" },
    { id: "asustado",   nombre: "Asustado",   nombreEn: "Scared",    emoji: "😨" },
    { id: "cansado",    nombre: "Cansado",    nombreEn: "Tired",     emoji: "😴" },
    { id: "sorprendido",nombre: "Sorprendido",nombreEn: "Surprised", emoji: "😮" },
    { id: "llorando",   nombre: "Llorando",   nombreEn: "Crying",    emoji: "😭" },
    { id: "serio",      nombre: "Serio",      nombreEn: "Serious",   emoji: "😐" },
    { id: "pensando",   nombre: "Pensando",   nombreEn: "Thinking",  emoji: "🤔" },
    { id: "feliz",      nombre: "Feliz",      nombreEn: "Cheerful",  emoji: "😄" },
    { id: "preocupado", nombre: "Preocupado", nombreEn: "Worried",   emoji: "😟" },
    { id: "contento",   nombre: "Contento",   nombreEn: "Pleased",   emoji: "😋" }
  ];
  EMOCIONES.forEach(emocion => {
    emocion.imagen = "assets/imagenes/emociones/" + emocion.id + ".svg";
  });

  const juegoEmociones = crearJuegoNuevo({
    modulo: "emociones", moduloNombre: "emocion", tituloInterno: "Emociones",
    items: EMOCIONES, pregunta: "emociones", etiquetaClave: "etiquetaEmocion",
    tipo: "imagen",
    acierto: item => f(t("aciertoEmocion"), {
      nombre: nombreDe(item, "emocion").toLowerCase()
    })
  });


  /* =======================================================
     10-QUATER. LABERINTOS (juego directo, sin etapa APRENDER)
     ======================================================= */
  /* Un caminito de piedras lleva al conejito hasta su zanahoria. El camino
     se genera siempre de forma que SIEMPRE hay una ruta válida, y solo se
     camina a la piedra de al lado: nunca se puede quedar atascado. */

  const LABERINTO_NIVELES = [
    { filas: 3, columnas: 3 },
    { filas: 4, columnas: 4 },
    { filas: 4, columnas: 4 },
    { filas: 5, columnas: 5 },
    { filas: 5, columnas: 5 },
    { filas: 6, columnas: 6 }
  ];

  function crearJuegoLaberintos() {
    const el = {};
    let jugando = false, bloqueado = false, completados = 0, nivel = 0;
    let pasos = [], posicion = 0, tiempos = [];
    let celdasPorPaso = [];       // las celdas del camino, por número de paso

    const alAzar = max => Math.floor(Math.random() * max);

    function mezclar(lista) {
      const copia = lista.slice();
      for (let i = copia.length - 1; i > 0; i--) {
        const j = alAzar(i + 1);
        const guardado = copia[i];
        copia[i] = copia[j];
        copia[j] = guardado;
      }
      return copia;
    }

    function masTarde(fn, ms) { tiempos.push(setTimeout(fn, ms)); }

    function limpiarTiempos() {
      tiempos.forEach(id => clearTimeout(id));
      tiempos = [];
    }

    function ocultarAviso() {
      if (!el.aviso) return;
      el.aviso.textContent = "";
      el.aviso.classList.remove("visible", "animo");
    }

    function estrellas() {
      if (!el.fiesta) return;
      el.fiesta.innerHTML = "";
      const iconos = ["⭐", "🌟", "✨", "🎉", "🥕"];
      for (let i = 0; i < 10; i++) {
        const estrella = document.createElement("span");
        estrella.className = "estrella";
        estrella.textContent = iconos[alAzar(iconos.length)];
        estrella.style.left = (6 + Math.random() * 84).toFixed(1) + "%";
        estrella.style.bottom = (8 + Math.random() * 30).toFixed(1) + "%";
        el.fiesta.appendChild(estrella);
      }
      masTarde(() => { el.fiesta.innerHTML = ""; }, 1800);
    }

    /* El camino: se baja-andando desde la esquina de abajo a la izquierda
       hasta la de arriba a la derecha, moviéndose solo a la derecha o hacia
       arriba. Así el camino nunca se cruza y siempre se llega. */
    function generarCamino(columnas, filas) {
      const camino = [[0, filas - 1]];
      let x = 0, y = filas - 1;
      const movimiento = [];
      for (let i = 0; i < columnas - 1; i++) movimiento.push("derecha");
      for (let i = 0; i < filas - 1; i++) movimiento.push("arriba");
      mezclar(movimiento).forEach(paso => {
        if (paso === "derecha") x++; else y--;
        camino.push([x, y]);
      });
      return camino;
    }

    function pintarConejito() {
      /* Se recorre el array de celdas que ya tenemos guardado: en el
         navegador .children no es un array y no tiene forEach. */
      celdasPorPaso.forEach((celda, indice) => {
        celda.classList.remove("conejito", "meta");
        if (indice === posicion) {
          celda.classList.add("conejito");
          celda.textContent = "🐰";
        } else if (indice === pasos.length - 1) {
          celda.classList.add("meta");
          celda.textContent = "🥕";
        } else {
          celda.textContent = "";
        }
      });
    }

    function nuevoLaberinto() {
      const spec = LABERINTO_NIVELES[Math.min(nivel, LABERINTO_NIVELES.length - 1)];
      pasos = generarCamino(spec.columnas, spec.filas);
      posicion = 0;

      if (el.tablero.style) {
        el.tablero.style.gridTemplateColumns = "repeat(" + spec.columnas + ", 1fr)";
      }

      el.tablero.innerHTML = "";
      celdasPorPaso = [];
      for (let fila = 0; fila < spec.filas; fila++) {
        for (let columna = 0; columna < spec.columnas; columna++) {
          const indice = pasos.findIndex(p => p[0] === columna && p[1] === fila);

          if (indice === -1) {
            /* Césped: no se puede pisar, pero tampoco pasa nada al tocarlo */
            const cesped = document.createElement("div");
            cesped.className = "celda-laberinto cesped";
            cesped.setAttribute("aria-hidden", "true");
            el.tablero.appendChild(cesped);
            continue;
          }

          const celda = document.createElement("button");
          celda.type = "button";
          celda.className = "celda-laberinto camino";
          celda.dataset.columna = String(columna);
          celda.dataset.fila = String(fila);
          celda.dataset.paso = String(indice);
          celda.setAttribute("aria-label", t("etiquetaLaberinto") + " " + (indice + 1));
          celda.addEventListener("click", () => alTocarCelda(indice));
          celdasPorPaso[indice] = celda;
          el.tablero.appendChild(celda);
        }
      }

      pintarConejito();
      ocultarAviso();      // la pista ya está escrita arriba, no se repite
    }

    function alTocarCelda(indice) {
      if (!jugando || bloqueado) return;
      if (Math.abs(indice - posicion) !== 1) return;    // solo a la piedra de al lado

      posicion = indice;
      pintarConejito();
      sonarTono(TONOS.escucha);

      if (el.aviso) el.aviso.classList.remove("visible");

      if (posicion === pasos.length - 1) llegar();
    }

    function llegar() {
      bloqueado = true;
      completados++;
      if (el.marcador) el.marcador.textContent = String(completados);

      if (el.aviso) {
        el.aviso.textContent = t("laberintoLlegada") + " " + mensajes().aciertoVisual;
        el.aviso.classList.add("visible");
      }
      estrellas();
      sonarTono(TONOS.acierto);
      hablar(t("laberintoLlegada"), "alegre");

      nivel++;
      masTarde(() => {
        if (!jugando) return;
        bloqueado = false;
        nuevoLaberinto();
      }, 3200);
    }

    function preparar() {
      el.tablero  = document.getElementById("tablero-laberinto");
      el.aviso    = document.getElementById("aviso-laberintos");
      el.fiesta   = document.getElementById("fiesta-laberintos");
      el.marcador = document.getElementById("marcador-laberintos");
    }

    function iniciar() {
      preparar();
      if (!el.tablero) {
        console.warn("Laberintos: falta el tablero en el HTML.");
        return;
      }
      jugando = true;
      bloqueado = false;
      completados = 0;
      nivel = 0;
      if (el.marcador) el.marcador.textContent = "0";
      nuevoLaberinto();
    }

    function detener() {
      jugando = false;
      bloqueado = false;
      limpiarTiempos();
      if (el.tablero) el.tablero.innerHTML = "";
      if (el.fiesta) el.fiesta.innerHTML = "";
      ocultarAviso();
    }

    return { iniciar, detener };
  }

  const juegoLaberintos = crearJuegoLaberintos();

  /* =======================================================
     10-QUINQUIES. ETAPA "APRENDER" (explorar sin presión)
     ======================================================= */
  /* Cada módulo tiene ahora DOS etapas:
       📚 APRENDER → el niño toca los elementos, los ve grandes y oye su
          nombre (y su sonido, si lo tiene) las veces que quiera.
          Aquí NO hay contador, ni ronda, ni respuesta correcta.
       🎮 JUGAR    → el motor de opciones: pregunta, 3 alternativas, una
          correcta, contador y celebración. Sin sonidos en las
          alternativas.
     Los datos son los MISMOS de cada módulo: no se duplica nada. */

  function crearAprender(cfg) {
    const modulo = cfg.modulo;
    const el = {};
    let seleccionado = null;
    let conectado = false;
    let indice = 0;
    let items = [];
    let grupo = null;             // categoría elegida (solo en Colores)

    /* Cómo se dibuja un elemento (emoji, letra, forma, color o imagen) */
    function dibujo(item, clase) {
      if (cfg.dibujo) return cfg.dibujo(item, clase);

      if (item.imagen) {
        const img = document.createElement("img");
        img.className = clase + " aprender-imagen";
        img.src = item.imagen;
        img.alt = "";
        img.setAttribute("aria-hidden", "true");
        return img;
      }

      const nodo = document.createElement("span");
      nodo.className = clase;
      nodo.textContent = item.emoji || "";
      nodo.setAttribute("aria-hidden", "true");
      return nodo;
    }

    function nombre(item) {
      return cfg.nombre ? cfg.nombre(item) : (item.nombre || "");
    }

    /* En Aprender, solo se habla cuando el usuario lo pide explícitamente.
       No se reproduce el sonido ni el nombre al solo hacer clic en una tarjeta. */
    function hablarDe(item) {
      const texto = nombre(item);
      /* Al tocar un elemento se dice su nombre en voz alta. En Animales,
         además, suena el animal (cfg.hablar se encarga de las dos cosas). */
      if (cfg.hablar) cfg.hablar(item);
      else hablar(texto, "normal");
    }

    /* La colección que se está viendo: toda, o la de la categoría elegida */
    function coleccion() {
      if (!cfg.grupos) return cfg.items;
      if (!grupo) return [];
      const elegido = cfg.grupos.filter(g => g.id === grupo)[0];
      return elegido ? elegido.items : [];
    }

    /* La tarjeta elegida se pone en el centro del álbum */
    function centrar() {
      const tarjeta = el.lista ? el.lista.children[indice] : null;
      if (tarjeta && typeof tarjeta.scrollIntoView === "function") {
        tarjeta.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }

    function marcarElegida() {
      if (!el.lista) return;
      Array.prototype.forEach.call(el.lista.children, (tarjeta, k) => {
        tarjeta.classList.toggle("elegida", k === indice);
      });
    }

    function pintarProgreso() {
      if (el.contador) {
        el.contador.textContent = items.length ? (indice + 1) + " / " + items.length : "— / —";
      }
    }


    /* La ficha grande: se ve el elemento, su nombre y su 🔊 */
    function seleccionar(item, i, conSonido) {
      seleccionado = item;
      if (typeof i === "number") indice = i;

      /* Al tocar se ve grande, se escribe su nombre y se oye (voz y, si
         es un animal con sonido, su sonido real). */
      if (el.grande) {
        el.grande.innerHTML = "";
        el.grande.appendChild(dibujo(item, "aprender-dibujo"));
        el.grande.hidden = false;
      }

      el.nombre.textContent = nombre(item);

      /* Segunda línea opcional (el nombre del color, en Colores y objetos) */
      if (el.extra) el.extra.textContent = cfg.extra ? cfg.extra(item) : "";

      el.escuchar.classList.remove("apagado");

      /* La tarjeta tocada da un saltito: se nota cuál sonó, sin cambiar
         de pantalla ni mostrar ningún cuadro arriba. */
      if (el.lista) {
        const tocada = el.lista.querySelector('[data-elemento="' + cfg.clave(item) + '"]');
        if (tocada) {
          tocada.classList.remove("salta");
          void tocada.offsetWidth;                 // reinicia la animación
          tocada.classList.add("salta");
          setTimeout(() => tocada.classList.remove("salta"), 700);
        }
      }

      marcarElegida();
      pintarProgreso();
      centrar();
      hablarDe(item);
      /* El sonido real (o el extra del módulo) suena solo si lo pide el
         botón 🔊 de la tarjeta: al tocar la tarjeta se dice el nombre. */
      if (conSonido && cfg.sonar) cfg.sonar(item);
    }

    /* El álbum: una fila de tarjetas grandes que se desliza */
    function pintarAlbum() {
      el.lista.innerHTML = "";
      if (el.volverCategorias) el.volverCategorias.hidden = !cfg.grupos;

      items.forEach((item, i) => {
        const tarjeta = document.createElement("button");
        tarjeta.type = "button";
        tarjeta.className = "album-tarjeta";
        tarjeta.dataset.elemento = cfg.clave(item);
        tarjeta.setAttribute("aria-label", nombre(item));

        tarjeta.appendChild(dibujo(item, "album-dibujo"));

        const etiqueta = document.createElement("span");
        etiqueta.className = "album-nombre";
        etiqueta.textContent = nombre(item);
        tarjeta.appendChild(etiqueta);

        const alto = document.createElement("span");
        alto.className = "album-sonido";
        alto.setAttribute("role", "button");
        alto.setAttribute("aria-label", t("escucharNombre"));
        alto.textContent = "🔊";
        alto.addEventListener("click", evento => {
          if (evento && evento.preventDefault) evento.preventDefault();
          if (evento && evento.stopPropagation) evento.stopPropagation();
          seleccionar(item, i, true);
        });
        tarjeta.appendChild(alto);

        tarjeta.addEventListener("click", () => seleccionar(item, i));
        el.lista.appendChild(tarjeta);
      });

      pintarProgreso();
    }

    /* Las 4 categorías de colores, como tarjetas grandes */
    function pintarCategorias() {
      el.lista.innerHTML = "";
      if (el.volverCategorias) el.volverCategorias.hidden = true;

      cfg.grupos.forEach(g => {
        const tarjeta = document.createElement("button");
        tarjeta.type = "button";
        tarjeta.className = "album-categoria";
        tarjeta.dataset.grupo = g.id;
        tarjeta.setAttribute("aria-label", t(g.nombreKey));

        const icono = document.createElement("span");
        icono.className = "categoria-icono";
        icono.textContent = g.emoji;
        icono.setAttribute("aria-hidden", "true");

        const nombre = document.createElement("span");
        nombre.className = "categoria-nombre";
        nombre.textContent = t(g.nombreKey);

        const cuenta = document.createElement("span");
        cuenta.className = "categoria-cuenta";
        cuenta.textContent = g.items.length + " " + t("coloresPalabra");

        tarjeta.append(icono, nombre, cuenta);
        tarjeta.addEventListener("click", () => abrirGrupo(g.id));
        el.lista.appendChild(tarjeta);
      });

      pintarProgreso();
    }

    function abrirGrupo(id) {
      /* La vista de categorías no es una pantalla: se anota para que el
         botón Volver regrese a ella (Primarios → Categorías → Módulo). */
      anotarHistorial("cat:" + cfg.modulo);
      grupo = id;
      items = coleccion();
      indice = 0;
      if (el.volverCategorias) el.volverCategorias.hidden = false;
      pintarAlbum();
      if (items.length) seleccionar(items[0], 0);
      else centrar();
    }

    function volverACategorias() {
      grupo = null;
      items = [];
      indice = 0;
      seleccionado = null;
      el.grande.innerHTML = "";
      if (el.escuchar) el.escuchar.hidden = true;
      if (el.extra) el.extra.textContent = "";
      el.escuchar.classList.add("apagado");
      el.nombre.textContent = t(cfg.pistaCategorias);
      pintarCategorias();
    }

    function preparar() {
      el.grande   = document.getElementById("aprender-" + modulo + "-grande");
      el.nombre   = document.getElementById("aprender-" + modulo + "-nombre");
      el.escuchar = document.getElementById("aprender-" + modulo + "-escuchar");
      el.lista    = document.getElementById("aprender-" + modulo + "-lista");
      el.extra    = document.getElementById("aprender-" + modulo + "-extra");
      el.contador = document.getElementById("aprender-" + modulo + "-contador");
      el.volverCategorias = document.getElementById("aprender-" + modulo + "-categorias");

      if (el.grande) el.grande.hidden = true;

      /* Los controles se conectan una sola vez (si no, se acumularían) */
      if (!conectado) {
        if (el.escuchar) el.escuchar.addEventListener("click", () => {
          if (seleccionado) hablarDe(seleccionado);
        });
        if (el.volverCategorias) el.volverCategorias.addEventListener("click", () => { olvidarCategorias(cfg.modulo); volverACategorias(); });
        conectado = true;
      }
    }

    function iniciar() {
      preparar();
      if (!el.lista || !el.grande || !el.nombre) {
        console.warn("Aprender " + modulo + ": faltan elementos en el HTML.");
        return;
      }

      seleccionado = null;
      el.grande.innerHTML = "";
      if (el.extra) el.extra.textContent = "";
      el.escuchar.classList.add("apagado");

      if (cfg.grupos) {
        /* Colores: primero se elige la categoría */
        grupo = null;
        items = [];
        indice = 0;
        el.nombre.textContent = t(cfg.pistaCategorias);
        pintarCategorias();
      } else {
        grupo = null;
        items = cfg.items.slice();
        indice = 0;
        el.nombre.textContent = t(cfg.pista);
        pintarAlbum();
      }
    }

    function detener() {
      if (el.lista) el.lista.innerHTML = "";
      if (el.grande) el.grande.innerHTML = "";
      if (el.escuchar) el.escuchar.classList.add("apagado");
      if (el.volverCategorias) el.volverCategorias.hidden = true;
      detenerAudio();
      seleccionado = null;
      items = [];
      indice = 0;
      grupo = null;
    }

    return { iniciar, detener, volverACategorias };
  }

  /* ---------- APRENDER de cada uno de los 6 módulos ---------- */

  /* Colores: los 20, agrupados por categorías (se elige la categoría) */
  const GRUPOS_COLORES = [
    { id: "primario",   nombreKey: "grupoPrimarios",   emoji: "🔴" },
    { id: "secundario", nombreKey: "grupoSecundarios", emoji: "🟢" },
    { id: "terciario",  nombreKey: "grupoTerciarios",  emoji: "🎨" },
    { id: "otro",       nombreKey: "grupoOtros",       emoji: "🌈" }
  ].map(g => Object.assign({}, g, {
    items: COLORES.filter(color => color.grupo === g.id)
  }));

  const aprenderColores = crearAprender({
    modulo: "colores",
    pista: "tocaUnColor",
    pistaCategorias: "pistaCategorias",
    grupos: GRUPOS_COLORES,
    items: COLORES,
    clave: color => color.id,
    nombre: color => nombreDe(color, "color"),
    dibujo: (color, clase) => {
      const nodo = document.createElement("span");
      nodo.className = clase + " aprender-color";
      nodo.style.backgroundColor = color.hex;
      nodo.setAttribute("aria-hidden", "true");
      return nodo;
    }
  });

  /* Números: del 1 al 10, con su nombre escrito */
  const aprenderNumeros = crearAprender({
    modulo: "numeros",
    pista: "tocaUnNumero",
    items: NUMEROS,
    clave: numero => String(numero.valor),
    nombre: numero => palabraDe(numero),
    dibujo: (numero, clase) => {
      const nodo = document.createElement("span");
      nodo.className = clase + " aprender-letra";
      nodo.textContent = String(numero.valor);
      nodo.setAttribute("aria-hidden", "true");
      return nodo;
    }
  });

  /* Formas: las 9 formas, cada una con su color */
  const aprenderFormas = crearAprender({
    modulo: "formas",
    pista: "tocaUnaForma",
    items: FORMAS,
    clave: forma => forma.id,
    nombre: forma => nombreDe(forma, "forma"),
    dibujo: (forma, clase) => {
      const nodo = colorearForma(document.createElement("span"), forma);
      nodo.className = "forma " + forma.clase + " " + clase + " aprender-forma";
      nodo.setAttribute("aria-hidden", "true");
      return nodo;
    }
  });

  /* Contar objetos: los 4 tipos de objetos */
  

  /* Animales: los 25, con su sonido real cuando existe */
  const aprenderAnimales = crearAprender({
    modulo: "animales",
    pista: "tocaUnAnimal",
    items: ANIMALES,
    clave: animal => animal.id,
    nombre: animal => nombreDe(animal, "animal"),
    /* Al tocar se dice SOLO el nombre, claro y amable: nada de rugidos ni
       onomatopeyas. El sonido real del animal queda en el 🔊 opcional de
       cada tarjeta del álbum (cfg.sonar). */
    hablar: animal => hablar(nombreDe(animal, "animal"), "normal"),
    sonar:  animal => sonarAnimal(animal)
  });

  /* Frutas: las 20 frutas */
  const aprenderFrutas = crearAprender({
    modulo: "frutas",
    pista: "tocaUnaFruta",
    items: FRUTAS,
    clave: fruta => fruta.id,
    nombre: fruta => nombreDe(fruta, "fruta")
  });

  /* ---------- APRENDER de los demás módulos ---------- */

  /* Vehículos: los 20, con su emoji */
  const aprenderVehiculos = crearAprender({
    modulo: "vehiculos",
    pista: "tocaUnVehiculo",
    items: VEHICULOS,
    clave: item => item.id,
    nombre: item => nombreDe(item, "vehiculo")
  });

  /* Partes del cuerpo: las 20, con su ilustración y la figura del niño
     que resalta la parte elegida (solo las partes visibles). */
  const aprenderCuerpo = crearAprender({
    modulo: "cuerpo",
    pista: "tocaUnaParte",
    items: CUERPO,
    clave: item => item.id,
    nombre: item => nombreDe(item, "cuerpo"),
  });

  /* Vocales: las 5, la letra en grande */
  const aprenderVocales = crearAprender({
    modulo: "vocales",
    pista: "tocaUnaVocal",
    items: VOCALES,
    clave: item => item.id,
    nombre: item => nombreDe(item, "vocal"),
    dibujo: (vocal, clase) => {
      const nodo = document.createElement("span");
      nodo.className = clase + " aprender-letra";
      nodo.textContent = vocal.emoji || vocal.nombre;
      nodo.setAttribute("aria-hidden", "true");
      return nodo;
    }
  });

  /* Alimentos: los 20 */
  const aprenderAlimentos = crearAprender({
    modulo: "alimentos",
    pista: "tocaUnAlimento",
    items: ALIMENTOS,
    clave: item => item.id,
    nombre: item => nombreDe(item, "alimento")
  });

  /* Objetos de la casa: los 20 */
  const aprenderCasa = crearAprender({
    modulo: "casa",
    pista: "tocaUnObjeto",
    items: CASA,
    clave: item => item.id,
    nombre: item => nombreDe(item, "objeto")
  });

  /* Familia: los 9 */
  const aprenderFamilia = crearAprender({
    modulo: "familia",
    pista: "tocaUnaFamilia",
    items: FAMILIA,
    clave: item => item.id,
    nombre: item => nombreDe(item, "familiar")
  });

  /* Conceptos y posiciones: las 36 ilustraciones */
  const aprenderConceptos = crearAprender({
    modulo: "conceptos",
    pista: "tocaUnConcepto",
    items: CONCEPTOS,
    clave: item => item.id,
    nombre: item => nombreDe(item, "concepto")
  });

  /* Emociones y expresiones: las 12 ilustraciones */
  const aprenderEmociones = crearAprender({
    modulo: "emociones",
    pista: "tocaUnaEmocion",
    items: EMOCIONES,
    clave: item => item.id,
    nombre: item => nombreDe(item, "emocion")
  });

  /* Colores y objetos: cada objeto con su nombre y su color */
  const aprenderColoresObjetos = crearAprender({
    modulo: "coloresobjetos",
    pista: "tocaUnObjetoColor",
    items: OBJETOS_COLOR,
    clave: item => item.id,
    nombre: item => nombreDe(item, "objeto"),
    extra:  item => nombreDe(colorDeObjeto(item), "color"),
    hablar: item => hablar(f(t("objetoYColor"), {
      objeto: nombreDe(item, "objeto").toLowerCase(),
      color:  nombreDelColor(colorDeObjeto(item))
    }), "normal")
  });

  /* =======================================================
     11. MÓDULOS DEL JUEGO
     ======================================================= */
  /* Cada módulo puede tener su propio "juego" (con iniciar/detener).
     Los que todavía no lo tengan mostrarán el aviso "muy pronto". */
  const MODULOS = {
    colores: {
      pantalla: "pantalla-colores",
      pantallaAprender: "pantalla-colores-aprender",
      zona:     "zona-colores",
      titulo:   "Los Colores",
      emoji:    "🎨",
      frase:    "¡Muy pronto aprenderemos los colores!",
      juego:    juegoColores,          // ✔ módulo terminado
      aprender: aprenderColores
    },
    numeros: {
      pantalla: "pantalla-numeros",
      pantallaAprender: "pantalla-numeros-aprender",
      zona:     "zona-numeros",
      titulo:   "Los Números",
      emoji:    "🔢",
      frase:    "¡Muy pronto contaremos del 1 al 10!",
      juego:    juegoNumeros,          // ✔ módulo terminado
      aprender: aprenderNumeros
    },
    formas: {
      pantalla: "pantalla-formas",
      pantallaAprender: "pantalla-formas-aprender",
      zona:     "zona-formas",
      titulo:   "Las Formas",
      emoji:    "🔺",
      frase:    "¡Muy pronto descubriremos las formas!",
      juego:    juegoFormas,           // ✔ módulo terminado
      aprender: aprenderFormas
    },
    contar: {
      pantalla: "pantalla-contar",
      zona:     "zona-contar",
      titulo:   "Contar Objetos",
      emoji:    "🍎",
      frase:    "¡Muy pronto contaremos objetos!",
      juego:    juegoContar            // ✔ juego directo, sin etapa APRENDER
    },
    animales: {
      pantalla: "pantalla-animales",
      pantallaAprender: "pantalla-animales-aprender",
      zona:     "zona-animales",
      titulo:   "Los Animales",
      emoji:    "🐶",
      frase:    "¡Muy pronto aprenderemos los animales!",
      juego:    juegoAnimales,         // ✔ módulo terminado
      aprender: aprenderAnimales
    },
    frutas: {
      pantalla: "pantalla-frutas",
      pantallaAprender: "pantalla-frutas-aprender",
      zona:     "zona-frutas",
      titulo:   "Las Frutas",
      emoji:    "🍓",
      frase:    "¡Muy pronto aprenderemos las frutas!",
      juego:    juegoFrutas,           // ✔ módulo terminado
      aprender: aprenderFrutas
    },
    vehiculos: {
      pantalla: "pantalla-vehiculos",
      pantallaAprender: "pantalla-vehiculos-aprender",
      zona:     "zona-vehiculos",
      titulo:   "Vehículos",
      emoji:    "🚗",
      frase:    "¡Muy pronto veremos los vehículos!",
      juego:    juegoVehiculos,
      aprender: aprenderVehiculos
    },
    cuerpo: {
      pantalla: "pantalla-cuerpo",
      pantallaAprender: "pantalla-cuerpo-aprender",
      zona:     "zona-cuerpo",
      titulo:   "El cuerpo",
      emoji:    "🧍",
      frase:    "¡Muy pronto veremos el cuerpo!",
      juego:    juegoCuerpo,
      aprender: aprenderCuerpo
    },
    vocales: {
      pantalla: "pantalla-vocales",
      pantallaAprender: "pantalla-vocales-aprender",
      zona:     "zona-vocales",
      titulo:   "Las vocales",
      emoji:    "🔤",
      frase:    "¡Muy pronto veremos las vocales!",
      juego:    juegoVocales,
      aprender: aprenderVocales
    },
    alimentos: {
      pantalla: "pantalla-alimentos",
      pantallaAprender: "pantalla-alimentos-aprender",
      zona:     "zona-alimentos",
      titulo:   "Los alimentos",
      emoji:    "🍽️",
      frase:    "¡Muy pronto veremos los alimentos!",
      juego:    juegoAlimentos,
      aprender: aprenderAlimentos
    },
    casa: {
      pantalla: "pantalla-casa",
      pantallaAprender: "pantalla-casa-aprender",
      zona:     "zona-casa",
      titulo:   "La casa",
      emoji:    "🏠",
      frase:    "¡Muy pronto veremos la casa!",
      juego:    juegoCasa,
      aprender: aprenderCasa
    },
    familia: {
      pantalla: "pantalla-familia",
      pantallaAprender: "pantalla-familia-aprender",
      zona:     "zona-familia",
      titulo:   "La familia",
      emoji:    "👨‍👩‍👧",
      frase:    "¡Muy pronto veremos la familia!",
      juego:    juegoFamilia,
      aprender: aprenderFamilia
    },
    coloresobjetos: {
      pantalla: "pantalla-coloresobjetos",
      pantallaAprender: "pantalla-coloresobjetos-aprender",
      zona:     "zona-coloresobjetos",
      titulo:   "Colores y objetos",
      emoji:    "🎨",
      frase:    "¡Muy pronto buscaremos objetos!",
      juego:    juegoColoresObjetos,
      aprender: aprenderColoresObjetos
    },
    dondevive: {
      pantalla: "pantalla-dondevive",
      zona:     "zona-dondevive",
      titulo:   "¿Dónde vive?",
      emoji:    "🐾",
      frase:    "¡Muy pronto veremos dónde viven!",
      juego:    juegoDondeVive
    },
    quesonido: {
      pantalla: "pantalla-quesonido",
      zona:     "zona-quesonido",
      titulo:   "¿Qué sonido es?",
      emoji:    "🔊",
      frase:    "¡Muy pronto escucharemos sonidos!",
      juego:    juegoQueSonido
    },
    laberintos: {
      pantalla: "pantalla-laberintos",
      zona:     "zona-laberintos",
      titulo:   "Laberintos",
      emoji:    "🌀",
      /* Este módulo es DIRECTO AL JUEGO: no tiene etapa APRENDER */
      juego:    juegoLaberintos
    },
    memoria: {
      pantalla: "pantalla-memoria",
      zona:     "zona-memoria",
      titulo:   "Memoria",
      emoji:    "🧠",
      frase:    "¡Muy pronto jugaremos a la memoria!",
      juego:    juegoMemoria
    },
    conceptos: {
      pantalla: "pantalla-conceptos",
      pantallaAprender: "pantalla-conceptos-aprender",
      zona:     "zona-conceptos",
      titulo:   "Conceptos y posiciones",
      emoji:    "📐",
      frase:    "¡Muy pronto veremos los conceptos!",
      juego:    juegoConceptos,
      aprender: aprenderConceptos
    },
    emociones: {
      pantalla: "pantalla-emociones",
      pantallaAprender: "pantalla-emociones-aprender",
      zona:     "zona-emociones",
      titulo:   "Emociones y expresiones",
      emoji:    "😀",
      frase:    "¡Muy pronto veremos las emociones!",
      juego:    juegoEmociones,
      aprender: aprenderEmociones
    },
  };

  /* =======================================================
     11-BIS. TRADUCIR LA INTERFAZ Y ELEGIR IDIOMA
     ======================================================= */
  /* Repinta los textos fijos del HTML en el idioma elegido. Los textos
     que escribe el motor (preguntas, nombres, botones de escuchar) se
     generan cada vez que empieza una ronda, así que ya salen traducidos. */
  function traducirInterfaz() {
    if (document.documentElement) document.documentElement.lang = IDIOMA;

    $$("[data-i18n]").forEach(elemento => {
      elemento.textContent = t(elemento.dataset.i18n);
    });

    if (botonVoz) {
      botonVoz.setAttribute("aria-label",
        CONFIG.vozActiva ? t("vozDesactivar") : t("vozActivar"));
    }

    /* El botón Volver es solo una flecha: su nombre va por aria-label */
    $$(".boton-volver").forEach(boton => boton.setAttribute("aria-label", t("volver")));
    if (botonInicio) botonInicio.setAttribute("aria-label", t("inicio"));
    if (botonVolverTop) botonVolverTop.setAttribute("aria-label", t("volver"));
  }

  /* El niño (o su familia) elige el idioma al abrir el juego: desde ahí
     todo —textos, preguntas, nombres y voz— usa ese idioma. */
  function elegirIdioma(idioma) {
    IDIOMA = (idioma === "en") ? "en" : "es";

    vozElegida = null;      // volvemos a elegir la mejor voz de ese idioma
    cargarVoces();
    traducirInterfaz();

    irA("pantalla-inicio");        // al menú principal, ya en su idioma
  }

  /* Los dos botones grandes de la pantalla de idioma */
  function conectarIdioma() {
    $$("[data-idioma]").forEach(boton => {
      boton.addEventListener("click", () => elegirIdioma(boton.dataset.idioma));
    });
  }

  /* =======================================================
     12. SISTEMA DE PANTALLAS
     ======================================================= */
  let pantallaActual = "pantalla-inicio";
  let moduloActivo   = null;

  function moduloDePantalla(idPantalla) {
    return Object.values(MODULOS).find(m => m.pantalla === idPantalla ||
                                            m.pantallaAprender === idPantalla) || null;
  }

  /* =======================================================
     HISTORIAL DE NAVEGACIÓN
     Cada cambio de pantalla anota la anterior, así el botón Volver
     deshace el camino real: categoría → módulo → menú → inicio.
     Las vistas de categorías (Colores) no son pantallas: se anotan
     como "cat:<modulo>" y al volver se restaura esa vista.
     ======================================================= */
  const historialPantallas = [];
  let volviendoAtras = false;

  function anotarHistorial(entrada) {
    if (volviendoAtras || !entrada) return;
    if (historialPantallas[historialPantallas.length - 1] === entrada) return;
    historialPantallas.push(entrada);
  }

  function olvidarCategorias(modulo) {
    const i = historialPantallas.lastIndexOf("cat:" + modulo);
    if (i !== -1) historialPantallas.splice(i, 1);
  }

  function volverAtras() {
    const entrada = historialPantallas.pop();

    if (entrada && entrada.indexOf("cat:") === 0) {
      const modulo = entrada.slice(4);
      const reg = MODULOS[modulo];
      if (reg && reg.pantallaAprender && pantallaActual !== reg.pantallaAprender) {
        volviendoAtras = true; irA(reg.pantallaAprender); volviendoAtras = false;
      }
      if (reg && reg.aprender && reg.aprender.volverACategorias) reg.aprender.volverACategorias();
      return;
    }

    if (entrada && document.getElementById(entrada)) {
      volviendoAtras = true; irA(entrada); volviendoAtras = false;
      return;
    }

    irA("pantalla-inicio");
  }

  /* Muestra una pantalla y arranca o detiene el módulo correspondiente */
  function irA(idPantalla) {
    const destino = document.getElementById(idPantalla);
    if (!destino) {
      console.warn("No existe la pantalla:", idPantalla);
      return;
    }

    // Anotamos de dónde venimos: "Volver" deshace el camino real
    if (pantallaActual && pantallaActual !== idPantalla) anotarHistorial(pantallaActual);

    // Apagamos el módulo anterior (corta voces y tiempos pendientes)
    if (moduloActivo) {
      if (moduloActivo.juego)    moduloActivo.juego.detener();
      if (moduloActivo.aprender) moduloActivo.aprender.detener();
    }
    moduloActivo = null;

    // Ocultamos todas las pantallas y mostramos la pedida
    $$(".pantalla").forEach(p => p.classList.remove("activa"));
    destino.classList.add("activa");

    pantallaActual = idPantalla;

    /* El "← Volver" de la cabecera solo se ofrece si hay algo anterior */
    if (botonVolverTop) botonVolverTop.hidden = historialPantallas.length === 0;

    const modulo = moduloDePantalla(idPantalla);
    const esAprender = !!(modulo && modulo.pantallaAprender === idPantalla);

    /* Cada módulo tiene dos etapas: 📚 APRENDER y 🎮 JUGAR */
    if (modulo && (esAprender ? modulo.aprender : modulo.juego)) {
      moduloActivo = modulo;
      if (esAprender) {
        if (modulo.aprender) modulo.aprender.iniciar();
      } else if (modulo.juego) {
        modulo.juego.iniciar();
      }
    } else {
      // Pantallas sin juego todavía: aviso "muy pronto"
      prepararModuloDePantalla(idPantalla);
      if (modulo) hablar(modulo.titulo);
    }
  }

  /* =======================================================
     13. AVISO "MUY PRONTO" (para módulos futuros sin juego)
     ======================================================= */
  function prepararModuloDePantalla(idPantalla) {
    const modulo = moduloDePantalla(idPantalla);
    if (!modulo || modulo.juego) return;

    const zona = document.getElementById(modulo.zona);
    if (!zona || zona.dataset.listo === "si") return;

    zona.appendChild(crearAvisoProximamente(modulo));
    zona.dataset.listo = "si";
  }

  /* Tarjeta grande y amable para una zona de juego todavía vacía */
  function crearAvisoProximamente(modulo) {
    const caja = document.createElement("div");
    caja.className = "proximamente";

    const emoji = document.createElement("span");
    emoji.className = "emoji";
    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = modulo.emoji;

    const titulo = document.createElement("span");
    titulo.className = "texto";
    titulo.textContent = modulo.titulo;

    const frase = document.createElement("span");
    frase.className = "texto";
    frase.textContent = modulo.frase;

    caja.append(emoji, titulo, frase);

    // Al tocar la tarjeta, la voz lo repite
    caja.addEventListener("click", () => hablar(modulo.frase, "pregunta"));

    return caja;
  }

  /* =======================================================
     14. EVENTOS
     ======================================================= */
  function conectarEventos() {
    // Todos los botones con data-ir cambian de pantalla
    $$("[data-ir]").forEach(boton => {
      // El Volver no salta a un destino fijo: deshace el historial
      if (boton.classList.contains("boton-volver")) return;
      boton.addEventListener("click", () => irA(boton.dataset.ir));
    });

    // Volver = pantalla anterior real (incluidas las vistas de categorías)
    $$(".boton-volver").forEach(boton => boton.addEventListener("click", volverAtras));

    // Botón de voz
    if (botonVoz) botonVoz.addEventListener("click", alternarVoz);

    // 🏠 Inicio: vuelve a la pantalla de elección de idioma
    if (botonInicio) botonInicio.addEventListener("click", () => irA("pantalla-idioma"));

    // ← Volver de la cabecera: misma navegación por historial
    if (botonVolverTop) botonVolverTop.addEventListener("click", volverAtras);

    // Las voces pueden cargarse después de arrancar
    if (hayVoz()) {
      window.speechSynthesis.onvoiceschanged = cargarVoces;
    }
  }

  /* =======================================================
     15. ARRANQUE
     ======================================================= */
  function iniciar() {
    cargarVoces();
    conectarEventos();
    conectarIdioma();
    traducirInterfaz();

    console.log("🎨 APRENDE CON LUCAS — listo.");
    console.log("Módulos disponibles:", Object.keys(MODULOS).join(", "));
    console.log("Colores del juego:", COLORES.map(c => c.nombre).join(", "));
    console.log("Números del juego: 1 al", NUMEROS.length);
    console.log("Formas del juego:", FORMAS.map(f => f.nombre).join(", "));
    console.log("Contar: cantidades del 1 al " + CANTIDADES.length +
                " con los objetos " + OBJETOS.join(" "));
    console.log("Animales del juego:", ANIMALES.length + " animales");
    console.log("Frutas del juego:", FRUTAS.length + " frutas");
    console.log("Idioma del juego:", IDIOMA);
    console.log("Vehículos:", VEHICULOS.length, "| Cuerpo:", CUERPO.length,
                "| Vocales:", VOCALES.length, "| Alimentos:", ALIMENTOS.length,
                "| Casa:", CASA.length, "| Familia:", FAMILIA.length);
    console.log("Colores y objetos:", COLORES.length, "colores y", OBJETOS_COLOR.length, "objetos",
                "| ¿Dónde vive?:", ANIMALES_LUGAR.length, "animales y", LUGARES.length, "lugares");
    console.log("¿Qué sonido es?:", ANIMALES_CON_SONIDO.length, "animales con sonido real",
                "| Conceptos:", CONCEPTOS.length, "| Emociones:", EMOCIONES.length);
    console.log("Voz elegida:", vozElegida
      ? (vozElegida.name + " (" + vozElegida.lang + ")")
      : "la del sistema");
    console.log("Sonidos de animales:", CONFIG.sonidosDeAnimales
      ? (SONIDOS_LISTOS.length + " de " + ANIMALES.length + " con sonido real en assets/sonidos/")
      : "desactivados (solo tonos del navegador)");
    if (CONFIG.sonidosDeAnimales) {
      console.log("Créditos de los sonidos (título · autor · licencia · enlace):");
      SONIDOS_LISTOS.forEach(id => console.log("   " + id + ": " + (CREDITOS_SONIDOS[id] || "(sin crédito)")));
    }
  }

  // Esperamos a que el HTML esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
