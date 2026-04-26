# De Cero a Desarrollador Full-Stack — Hoja de Ruta de Aprendizaje Completa

> Para alguien sin habilidades de computadora que quiere construir y comprender sistemas como el Mundo de Juan.

**Tiempo estimado:** 8–12 meses de estudio consistente a tiempo parcial (10–15 horas/semana).  
**Costo total:** $0–$200 (todo lo que aparece a continuación tiene excelentes opciones gratuitas).  
**Prerrequisito:** Ninguno. Esto comienza desde encender una computadora.

---

## Filosofía: Cómo Aprender Esto

1. **Construye cosas de inmediato.** No esperes hasta que "sepas suficiente." Cada sección de abajo incluye un pequeño proyecto.
2. **La consistencia vence a la intensidad.** 30 minutos todos los días es mejor que 5 horas una vez por semana.
3. **La lucha es aprendizaje.** Si copias y pegas sin entender, no aprendiste nada. Si te quedas mirando un error durante una hora y lo arreglas, lo aprendiste todo.
4. **Enseña lo que aprendes.** Explica los conceptos en voz alta a ti mismo, a un patito de goma, o a un amigo. Si no puedes explicarlo de forma simple, aún no lo entiendes.

---

## Fase 0: Alfabetización Digital (Semanas 1–4)

**Objetivo:** Sentirte cómodo usando una computadora e internet como herramientas.

### Qué Aprender

- **Mecanografía.** Necesitas escribir sin mirar el teclado. Este es tu cuello de botella para todo lo demás.
- **Gestión de archivos.** Crear carpetas, mover archivos, entender extensiones de archivo (`.txt`, `.jpg`, `.pdf`).
- **Internet.** Usar un navegador, marcadores, pestañas, descargas, entender URLs.
- **Correo electrónico.** Enviar, adjuntar archivos, organizar carpetas.
- **Tu sistema operativo.** Windows, macOS o Linux básico: instalar programas, encontrar configuraciones, usar el explorador de archivos/buscador.
- **Editores de texto.** Instalar VS Code y aprender a abrir/guardar archivos.

### Recursos

| Recurso | Qué Es | Costo | Tiempo |
|----------|-----------|------|------|
| [typing.com](https://www.typing.com) | Lecciones de mecanografía a ciegas | Gratis | 15 min/día durante 3–4 semanas |
| [GCF Global — Computer Basics](https://edu.gcfglobal.org/en/computerbasics/) | Introducción extremadamente suave a las computadoras | Gratis | 2–3 horas en total |
| [GCF Global — Internet Basics](https://edu.gcfglobal.org/en/internetbasics/) | Cómo funciona internet para principiantes absolutos | Gratis | 2–3 horas en total |
| [VS Code for Beginners (YouTube)](https://www.youtube.com/watch?v=ORrELERGIHs) | Cómo instalar y usar el editor de código | Gratis | 1 hora |

### Proyecto: Construir un Sistema de Carpetas Personal

Crea una carpeta en tu computadora llamada `learning-journey`. Dentro de ella, crea carpetas para cada mes. Dentro de cada mes, crea un archivo de texto donde escribas una cosa que aprendiste ese día. Practica crear, mover, renombrar y eliminar archivos hasta que se sienta effortless.

---

## Fase 1: Cómo Funciona la Web (Semanas 5–7)

**Objetivo:** Entender qué es realmente un sitio web antes de intentar construir uno.

### Qué Aprender

- **¿Qué es un sitio web?** Una colección de archivos (HTML, CSS, imágenes) almacenados en una computadora que siempre está encendida (un servidor).
- **¿Qué es HTML?** La estructura/contenido de una página (encabezados, párrafos, imágenes, enlaces).
- **¿Qué es CSS?** El estilo (colores, fuentes, diseño, espaciado).
- **El trabajo del navegador.** Lee HTML y CSS y los convierte en la página visual que ves.
- **Herramientas de desarrollador.** Clic derecho en cualquier página web → "Inspeccionar." Puedes ver el HTML y CSS de cualquier sitio del mundo.
- **URLs y dominios.** Qué significan `https://`, `www.`, `.com`, y `?search=term`.
- **Hospedaje.** Cómo los archivos pasan de una computadora a internet.

### Recursos

| Recurso | Qué Es | Costo | Tiempo |
|----------|-----------|------|------|
| [Mozilla MDN — Web Basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web) | El tutorial web más respetado de internet | Gratis | 6–8 horas |
| [Internet 101 (Khan Academy)](https://www.khanacademy.org/computing/computer-science/internet-intro) | Cómo funciona internet, paquetes, DNS, direcciones IP | Gratis | 3–4 horas |
| [CodePen](https://codepen.io) | Un sitio web donde puedes escribir HTML/CSS y ver resultados al instante | Gratis | Usa diariamente para practicar |

### Conceptos Clave para Entender Profundamente

- **Etiqueta HTML:** Un fragmento de texto dentro de corchetes angulares, como `<h1>Hola</h1>`. El `<h1>` es la etiqueta de apertura, `</h1>` es la etiqueta de cierre, y "Hola" es el contenido.
- **Selector CSS:** Una forma de apuntar a elementos HTML. `h1 { color: red; }` hace que todos los `<h1>` sean rojos.
- **El DOM (Modelo de Objetos del Documento):** La representación interna del navegador de una página web como un árbol de objetos. Cuando "Inspeccionas un Elemento," estás mirando el DOM.

### Proyecto: Construir una Página de Perfil Personal

Crea un solo archivo HTML llamado `about-me.html`. Debería tener:
- Tu nombre como un encabezado grande (`<h1>`)
- Un párrafo sobre ti (`<p>`)
- Una foto tuya (`<img>`)
- Una lista de tus cosas favoritas (`<ul>` y `<li>`)
- Enlaces a tus sitios web favoritos (`<a>`)
- CSS que cambie el color de fondo, la fuente, y centre el encabezado

Abre este archivo en tu navegador. Aún no está en internet — vive en tu computadora. Eso está bien. Cada sitio web comienza así.

---

## Fase 2: Fundamentos de Programación (Semanas 8–18)

**Objetivo:** Aprender a pensar como un programador. Esta es la fase más difícil. No la apresures.

### Qué Aprender

- **JavaScript.** El lenguaje de programación de la web. Lo usarás durante los próximos varios años.
- **Variables.** Contenedores con nombre para datos: `let name = "Juan"`
- **Tipos de datos.** Cadenas (texto), números, booleanos (verdadero/falso), arreglos (listas), objetos (colecciones de datos etiquetados).
- **Funciones.** Bloques de código reutilizables: `function greet(name) { return "Hola " + name; }`
- **Condicionales.** Tomar decisiones: `if (age > 18) { ... } else { ... }`
- **Bucles.** Hacer cosas repetidamente: `for`, `while`.
- **Depuración.** Leer mensajes de error, usar `console.log()`, dividir problemas en piezas más pequeñas.
- **La línea de comandos (terminal).** Escribir comandos en lugar de hacer clic. Esto es intimidante al principio pero esencial.
- **Git.** Una herramienta que guarda instantáneas de tu código para que puedas deshacer errores y colaborar.

### Recursos

| Recurso | Qué Es | Costo | Tiempo |
|----------|-----------|------|------|
| [freeCodeCamp — JavaScript Algorithms and Data Structures](https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/) | Gratis, interactivo, completo. Haz cada ejercicio. | Gratis | 60–80 horas |
| [The Odin Project — Foundations](https://www.theodinproject.com/paths/foundations/courses/foundations) | Currículo full-stack gratuito. La sección de JavaScript es excelente. | Gratis | 4–6 semanas |
| [JavaScript.info](https://javascript.info) | La mejor referencia escrita de JavaScript. Léela como un libro de texto. | Gratis | Lee junto a freeCodeCamp |
| [Codecademy — Learn the Command Line](https://www.codecademy.com/learn/learn-the-command-line) | Práctica interactiva de terminal | Gratis (nivel básico) | 4–5 horas |
| [Oh Shit, Git!?](https://ohshitgit.com) | Guía amigable para cuando Git sale mal | Gratis | Referencia |
| [GitHub Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf) | Hoja de referencia de una página con comandos esenciales | Gratis | Imprime y mantén cerca |

### Conceptos Clave para Entender Profundamente

- **Una variable es una caja con una etiqueta.** `let x = 5` crea una caja etiquetada "x" y pone 5 adentro.
- **Una función es una receta.** Toma ingredientes (parámetros), sigue pasos, y produce un resultado (valor de retorno).
- **Un arreglo es una lista numerada.** `["manzana", "plátano", "cereza"]` — "manzana" está en el índice 0, "plátano" en 1, "cereza" en 2.
- **Un objeto es una colección etiquetada.** `{ name: "Juan", age: 30 }` — accedes a los valores por su etiqueta: `person.name` te da `"Juan"`.
- **Alcance (Scope).** Las variables declaradas dentro de una función solo existen dentro de esa función. Esto evita que diferentes partes de tu código interfieran accidentalmente entre sí.

### Proyecto: Construir una App de Lista de Tareas (Versión Consola)

Crea un archivo JavaScript que se ejecute en la consola del navegador (o Node.js) y te permita:
- Agregar una tarea a una lista
- Marcar una tarea como completada
- Eliminar una tarea
- Imprimir todas las tareas

Aún no construyas una interfaz visual. Solo usa `console.log()` y funciones. La lógica es lo que importa. Ejemplo:

```javascript
let tasks = [];

function addTask(title) {
  tasks.push({ title: title, done: false });
}

function markDone(index) {
  tasks[index].done = true;
}

function showTasks() {
  console.log("Mis Tareas:");
  tasks.forEach((task, i) => {
    console.log(i + ". " + (task.done ? "[x]" : "[ ]") + " " + task.title);
  });
}
```

### Proyecto: Usar Git por Primera Vez

1. Instala Git.
2. En tu terminal, navega a tu carpeta `learning-journey`.
3. Ejecuta `git init` para convertirla en un repositorio Git.
4. Ejecuta `git add .` para preparar tus archivos.
5. Ejecuta `git commit -m "Mi primer commit"` para guardar una instantánea.
6. Crea una cuenta en [GitHub](https://github.com).
7. Crea un nuevo repositorio y sigue las instrucciones para enviar tu código.

Has respaldado tu código a internet. Esto es lo que los desarrolladores profesionales hacen docenas de veces al día.

---

## Fase 3: Desarrollo Frontend (Semanas 19–28)

**Objetivo:** Construir sitios web hermosos e interactivos que se ejecuten en el navegador.

### Qué Aprender

- **Elementos semánticos HTML5.** `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>` — estos describen el *significado* del contenido, no solo su apariencia.
- **Diseño CSS.** Flexbox y CSS Grid — la forma moderna de organizar elementos en una página.
- **Diseño responsivo.** Hacer que tu sitio se vea bien en teléfonos, tablets y computadoras de escritorio usando media queries.
- **JavaScript en el navegador.** La API del DOM — seleccionar elementos, escuchar clics, cambiar contenido dinámicamente.
- **React.** La biblioteca de JavaScript más popular para construir interfaces de usuario. Te permite construir sitios web a partir de "componentes" reutilizables (como ladrillos de Lego).
- **NPM.** El Node Package Manager — cómo instalas bibliotecas de JavaScript escritas por otras personas.

### Recursos

| Recurso | Qué Es | Costo | Tiempo |
|----------|-----------|------|------|
| [freeCodeCamp — Responsive Web Design](https://www.freecodecamp.org/learn/2022/responsive-web-design/) | Certificación de HTML y CSS | Gratis | 30–40 horas |
| [Flexbox Froggy](https://flexboxfroggy.com) | Un juego que enseña CSS Flexbox | Gratis | 1–2 horas |
| [Grid Garden](https://cssgridgarden.com) | Un juego que enseña CSS Grid | Gratis | 1–2 horas |
| [JavaScript30](https://javascript30.com) | 30 pequeños proyectos de JavaScript vanilla en 30 días | Gratis | 30 días, 1 hora/día |
| [Scrimba — Learn React](https://scrimba.com/learn/learnreact) | Curso interactivo de React con un profesor fantástico | Gratis | 10–12 horas |
| [React Official Tutorial](https://react.dev/learn) | La documentación oficial de React | Gratis | 6–8 horas |
| [The Odin Project — Full Stack JavaScript](https://www.theodinproject.com/paths/full-stack-javascript) | Currículo completo incluyendo React y Node.js | Gratis | 6–8 meses en total |

### Conceptos Clave para Entender Profundamente

- **El DOM es un árbol.** Cada elemento HTML es un nodo. JavaScript puede recorrer este árbol, encontrar nodos, modificarlos, agregar nuevos, o eliminarlos.
- **Escuchadores de eventos.** `button.addEventListener("click", handleClick)` — cuando el usuario hace clic en el botón, ejecuta la función `handleClick`.
- **Estado de React.** `const [count, setCount] = useState(0)` — una forma de almacenar datos que, cuando cambian, actualizan automáticamente la página visible.
- **Componentes de React.** Una función que devuelve JSX similar a HTML. `<Button color="red">Haz clic</Button>` — reutilizable, componible, predecible.
- **Props.** Datos pasados de un componente padre a un componente hijo. Como parámetros de función, pero para piezas de interfaz de usuario.

### Proyecto: Construir un Panel del Clima

Usa una API de clima gratuita (como [Open-Meteo](https://open-meteo.com)) para construir una app de React que:
- Tenga un campo de entrada para el nombre de una ciudad
- Obtenga datos del clima cuando el usuario envíe
- Muestre temperatura, condiciones y un pronóstico de 5 días
- Cambie el color de fondo basado en las condiciones del clima
- Funcione en teléfonos móviles (diseño responsivo)

Este proyecto te enseña: componentes de React, estado, `fetch()` API, async/await, diseño CSS, y diseño responsivo.

### Proyecto: Reconstruir tu Página de Perfil en React

Toma tu página de perfil de la Fase 1 y reconstrúyela como una aplicación React. Agrega:
- Un interruptor de modo oscuro (usa estado de React)
- Un formulario de contacto (usa manejadores de eventos)
- Múltiples páginas usando React Router

---

## Fase 4: Backend y Bases de Datos (Semanas 29–38)

**Objetivo:** Entender qué sucede en el servidor cuando alguien visita tu sitio web.

### Qué Aprender

- **Node.js.** Ejecutar JavaScript fuera del navegador, en un servidor.
- **HTTP.** El protocolo que usan los navegadores y servidores para comunicarse. Métodos: GET, POST, PUT, DELETE. Códigos de estado: 200, 404, 500.
- **Express.js.** Un framework ligero para construir APIs de servidor en Node.js.
- **APIs (Interfaces de Programación de Aplicaciones).** Cómo diferentes piezas de software se comunican entre sí. Tu frontend le pide datos a tu backend a través de una API.
- **JSON.** El formato de datos que casi todas las APIs modernas usan.
- **Bases de datos.** Por qué las necesitas, cómo almacenan datos de forma persistente.
- **Redis.** Una base de datos en memoria. Rápida, simple, perfecta para caché y conjuntos de datos pequeños.
- **Básicos de SQL.** SELECT, INSERT, UPDATE, DELETE. No necesitas ser experto, pero deberías entender el concepto.
- **Autenticación.** Cómo los usuarios prueban quiénes son. Contraseñas, hash, sesiones, cookies, tokens JWT.

### Recursos

| Recurso | Qué Es | Costo | Tiempo |
|----------|-----------|------|------|
| [Node.js Official Docs](https://nodejs.org/en/docs/) | Documentación para ejecutar JS en servidores | Gratis | Referencia |
| [Express.js Getting Started](https://expressjs.com/en/starter/installing.html) | Construye tu primer servidor | Gratis | 4–6 horas |
| [freeCodeCamp — Back End Development and APIs](https://www.freecodecamp.org/learn/back-end-development-and-apis/) | Certificación de Node, Express, MongoDB | Gratis | 40–50 horas |
| [Redis University](https://university.redis.com) | Cursos gratuitos de Redis de sus creadores | Gratis | 6–8 horas |
| [JWT.io Introduction](https://jwt.io/introduction) | Cómo funcionan los JSON Web Tokens | Gratis | 30 minutos |
| [Mozilla MDN — HTTP Overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview) | Cómo funcionan las solicitudes y respuestas HTTP | Gratis | 2–3 horas |

### Conceptos Clave para Entender Profundamente

- **Ciclo de solicitud/respuesta.** El navegador envía una *solicitud*. El servidor la procesa y envía una *respuesta*. Cada interacción en la web sigue este patrón.
- **Ruta.** Un patrón de URL en el servidor que maneja solicitudes específicas. `GET /users` podría devolver una lista de usuarios. `POST /users` podría crear un nuevo usuario.
- **Middleware.** Funciones que se ejecutan entre recibir una solicitud y enviar una respuesta. Pueden verificar autenticación, registrar solicitudes, analizar cuerpos JSON, etc.
- **Hashear contraseñas.** Nunca almacenas contraseñas en texto plano. Las ejecutas a través de una función matemática unidireccional (como PBKDF2 o bcrypt) y almacenas el resultado. Incluso si tu base de datos es robada, las contraseñas son inútiles.
- **Variables de entorno.** Valores de configuración secretos (claves API, contraseñas de bases de datos) que no se almacenan en tu código. Viven en un archivo `.env` que nunca se compromete en Git.

### Proyecto: Construir una API REST para tu App de Tareas

Crea un servidor Node.js/Express con estos puntos finales:
- `GET /tasks` — devuelve todas las tareas
- `POST /tasks` — crea una nueva tarea (cuerpo: `{ title: "..." }`)
- `PATCH /tasks/:id` — marca una tarea como hecha
- `DELETE /tasks/:id` — elimina una tarea

Almacena las tareas en un archivo JSON al principio. Luego actualiza a Redis. Luego construye un frontend de React que se comunique con esta API.

### Proyecto: Agregar Autenticación a tu API

Implementa registro de usuario e inicio de sesión:
- `POST /register` — hashea la contraseña, almacena el usuario
- `POST /login` — verifica la contraseña, crea una cookie de sesión
- Protege `GET /tasks` para que los usuarios solo vean sus propias tareas

Usa el mismo patrón exacto que el Mundo de Juan: PBKDF2 para hash, HMAC-SHA256 para cookies de sesión.

---

## Fase 5: Full-Stack y el Stack del Mundo de Juan (Semanas 39–46)

**Objetivo:** Construir aplicaciones completas y desplegables usando las mismas tecnologías que el Mundo de Juan.

### Qué Aprender

- **Next.js.** El framework de React que combina páginas frontend y rutas API backend en un solo proyecto.
- **Funciones serverless.** Código que se ejecuta en la nube solo cuando se necesita. Ningún servidor que gestionar.
- **Vercel.** Despliega apps de Next.js con un clic. HTTPS automático, CDN global, configuración cero.
- **Upstash Redis.** Redis gestionado con una API REST, perfecto para serverless.
- **Resend.** Enviar correos electrónicos desde tu aplicación.
- **Procesamiento de Markdown.** Usar `gray-matter` y `marked` para convertir archivos Markdown a HTML.
- **Integración frontend/backend.** Tus componentes de React `fetch()` datos de tus rutas API. Las rutas API leen de Redis. Los datos fluyen en círculo completo.

### Recursos

| Recurso | Qué Es | Costo | Tiempo |
|----------|-----------|------|------|
| [Next.js Learn Course](https://nextjs.org/learn) | Tutorial interactivo oficial de Next.js | Gratis | 8–10 horas |
| [Next.js Documentation](https://nextjs.org/docs) | La referencia definitiva. Lee las secciones del App Router. | Gratis | Referencia continua |
| [Vercel Documentation](https://vercel.com/docs) | Cómo desplegar y configurar Next.js en Vercel | Gratis | 2–3 horas |
| [Upstash Documentation](https://docs.upstash.com/redis) | Cómo conectar a Redis desde una app de Next.js | Gratis | 1–2 horas |
| [Resend Documentation](https://resend.com/docs) | Cómo enviar correos electrónicos desde tu API | Gratis | 1 hora |
| [Manual DevOps del Mundo de Juan](DEVOPS_MANUAL.md) | La guía completa para este sistema exacto | Gratis | Léelo dos veces |

### Conceptos Clave para Entender Profundamente

- **Server Components vs. Client Components (React/Next.js).** Algunas partes de tu página se ejecutan en el servidor (donde pueden acceder a bases de datos directamente). Algunas partes se ejecutan en el navegador (donde pueden responder a clics de usuario). Saber cuál es cuál previene muchos errores.
- **Rutas API en Next.js.** Los archivos en `app/api/.../route.ts` automáticamente se convierten en puntos finales HTTP. No se necesita Express.
- **Compilación vs. Tiempo de ejecución.** Cuando despliegas, Next.js "compila" tu app una vez (genera archivos optimizados). Cuando un visitante llega, el "tiempo de ejecución" ejecuta tu código. Algunas cosas solo funcionan en tiempo de compilación; otras solo en tiempo de ejecución.
- **Estrategias de respaldo.** ¿Qué sucede cuando tu base de datos principal está caída? El patrón del Mundo de Juan — Redis primero, sistema de archivos segundo, memoria tercero — es un enfoque profesional de grado para confiabilidad.

### Proyecto: Construir una Plataforma de Blog (tu propio Mundo de Juan)

Crea una aplicación de Next.js con:
- Una página de inicio mostrando publicaciones recientes
- Una página para cada publicación (obtenida de Redis)
- Una página de inicio de sesión de administrador
- Un panel protegido donde los administradores pueden crear/editar/eliminar publicaciones
- Soporte Markdown para el contenido de las publicaciones
- Un sistema de claves API para que un script externo (tu "agente de IA") pueda publicar publicaciones
- Despliégala en Vercel

Esta es una versión simplificada del Mundo de Juan. Si puedes construir esto, entiendes cada concepto central del sistema.

### Proyecto: Leer y Modificar el Mundo de Juan

Clona el repositorio del Mundo de Juan. Intenta:
1. Ejecutarlo localmente (`npm install`, `npm run dev`).
2. Agregar una nueva página estática a `public/`.
3. Agregar una nueva ruta API que devuelva una cita aleatoria.
4. Modificar la página del diario para mostrar publicaciones en un orden diferente.
5. Agregar una nueva variable de entorno y usarla en una ruta API.

Si puedes hacer todo esto, ya no eres un principiante. Eres un desarrollador.

---

## Horario Semanal Recomendado (Tiempo Parcial)

Si puedes dedicar 10–15 horas por semana, aquí hay un ritmo sostenible:

| Día | Actividad | Tiempo |
|-----|----------|-------|
| **Lunes** | Leer/ver teoría (nuevo concepto) | 1 hora |
| **Martes** | Practicar con ejercicios interactivos | 1 hora |
| **Miércoles** | Trabajar en tu proyecto | 1 hora |
| **Jueves** | Leer documentación o código fuente | 1 hora |
| **Viernes** | Trabajar en tu proyecto + depurar | 1 hora |
| **Sábado** | Trabajo profundo en proyecto o ponerse al día | 2–3 horas |
| **Domingo** | Descansar, o revisar lo que aprendiste | 0–1 hora |

**La regla de los 20 minutos:** Si estás atascado en un error o concepto por más de 20 minutos, escribe exactamente qué no entiendes y pide ayuda. No golpees tu cabeza contra la pared por horas. Publica en [Stack Overflow](https://stackoverflow.com), pregunta en una comunidad de Discord, o usa ChatGPT/Claude para explicar el concepto. Luego cierra la explicación e intenta implementarlo tú mismo.

---

## Comunidades y Soporte

No aprendes a programar solo. Únete a estas comunidades:

| Comunidad | Dónde | Por Qué Unirse |
|-----------|-------|----------|
| **freeCodeCamp Forum** | [forum.freecodecamp.org](https://forum.freecodecamp.org) | Amigable, enfocado en principiantes, no hay preguntas tontas |
| **The Odin Project Discord** | [discord.gg/theodinproject](https://discord.gg/theodinproject) | Activo, de apoyo, ayuda alineada con el currículo |
| **Reactiflux Discord** | [reactiflux.com](https://reactiflux.com) | La comunidad de React más grande, excelente para preguntas de React/Next.js |
| **Dev.to** | [dev.to](https://dev.to) | Artículos de blog de desarrolladores de todos los niveles. Lee un artículo por día. |
| **r/learnprogramming** | [reddit.com/r/learnprogramming](https://reddit.com/r/learnprogramming) | Comunidad enorme, buena para motivación y consejos de carrera |

---

## Mentalidad: La Curva de Dificultad

Aprender a programar no es lineal. Aquí está qué esperar:

- **Meses 1–2:** Todo es nuevo y emocionante. Estás aprendiendo rápido.
- **Meses 3–4:** El "valle de la desesperación." Sabes lo suficiente para saber cuánto no sabes. Los proyectos se sienten más difíciles. Esto es normal. Sigue adelante.
- **Meses 5–6:** Las cosas comienzan a conectar. Puedes construir proyectos pequeños sin tutoriales.
- **Meses 7–9:** Puedes leer documentación y resolver cosas de forma independiente.
- **Meses 10–12:** Puedes construir una aplicación completa desde cero y desplegarla.

Las personas que tienen éxito no son las más inteligentes. Son las más consistentes.

---

## Cuándo Comenzar a Aplicar para Trabajos

Si tu objetivo es el empleo como desarrollador:

- **Desarrollador Frontend Junior:** Después de la Fase 3 (Frontend). Necesitas un portafolio de 3–4 proyectos de React.
- **Desarrollador Full-Stack Junior:** Después de la Fase 5. Necesitas un portafolio de 2–3 proyectos full-stack con autenticación, bases de datos y despliegue.
- **Lo que los empleadores quieren ver:**
  - Un perfil de GitHub con código limpio y documentado
  - Un sitio web personal que hospede tus proyectos
  - Proyectos que resuelvan problemas reales (no solo copias de tutoriales)
  - Evidencia de que puedes aprender (te enseñaste a ti mismo, después de todo)

Comienza a aplicar antes de sentirte "listo." El proceso de entrevista en sí mismo es parte del aprendizaje.

---

*Buena suerte. La parte más difícil es comenzar. Ya hiciste eso al leer hasta aquí.*
