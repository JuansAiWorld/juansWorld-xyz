# Zero to Full-Stack Developer — A Complete Learning Roadmap

> For someone with no computer skills who wants to build and understand systems like Juan's World.

**Time estimate:** 8–12 months of consistent part-time study (10–15 hours/week).  
**Total cost:** $0–$200 (everything below has excellent free options).  
**Prerequisite:** None. This starts from turning on a computer.

---

## Philosophy: How to Learn This

1. **Build things immediately.** Don't wait until you "know enough." Every section below includes a small project.
2. **Consistency beats intensity.** 30 minutes every day is better than 5 hours once a week.
3. **Struggle is learning.** If you copy-paste without understanding, you learned nothing. If you stare at a bug for an hour and fix it, you learned everything.
4. **Teach what you learn.** Explain concepts out loud to yourself, a rubber duck, or a friend. If you can't explain it simply, you don't understand it yet.

---

## Phase 0: Digital Literacy (Weeks 1–4)

**Goal:** Be comfortable using a computer and the internet as tools.

### What to Learn

- **Typing.** You need to type without looking at the keyboard. This is your bottleneck for everything else.
- **File management.** Creating folders, moving files, understanding file extensions (`.txt`, `.jpg`, `.pdf`).
- **The internet.** Using a browser, bookmarks, tabs, downloads, understanding URLs.
- **Email.** Sending, attaching files, organizing folders.
- **Your operating system.** Windows, macOS, or Linux basics: installing programs, finding settings, using the file explorer/finder.
- **Text editors.** Install VS Code and learn to open/save files.

### Resources

| Resource | What It Is | Cost | Time |
|----------|-----------|------|------|
| [typing.com](https://www.typing.com) | Touch typing lessons | Free | 15 min/day for 3–4 weeks |
| [GCF Global — Computer Basics](https://edu.gcfglobal.org/en/computerbasics/) | Extremely gentle intro to computers | Free | 2–3 hours total |
| [GCF Global — Internet Basics](https://edu.gcfglobal.org/en/internetbasics/) | How the internet works for absolute beginners | Free | 2–3 hours total |
| [VS Code for Beginners (YouTube)](https://www.youtube.com/watch?v=ORrELERGIHs) | How to install and use the code editor | Free | 1 hour |

### Project: Build a Personal Folder System

Create a folder on your computer called `learning-journey`. Inside it, create folders for each month. Inside each month, create a text file where you write one thing you learned that day. Practice creating, moving, renaming, and deleting files until it feels effortless.

---

## Phase 1: How the Web Works (Weeks 5–7)

**Goal:** Understand what a website actually is before you try to build one.

### What to Learn

- **What is a website?** A collection of files (HTML, CSS, images) stored on a computer that is always on (a server).
- **What is HTML?** The structure/content of a page (headings, paragraphs, images, links).
- **What is CSS?** The styling (colors, fonts, layout, spacing).
- **The browser's job.** It reads HTML and CSS and turns them into the visual page you see.
- **Developer Tools.** Right-click any webpage → "Inspect." You can see the HTML and CSS of any site in the world.
- **URLs and domains.** What `https://`, `www.`, `.com`, and `?search=term` mean.
- **Hosting.** How files get from a computer to the internet.

### Resources

| Resource | What It Is | Cost | Time |
|----------|-----------|------|------|
| [Mozilla MDN — Web Basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web) | The most respected web tutorial on the internet | Free | 6–8 hours |
| [Internet 101 (Khan Academy)](https://www.khanacademy.org/computing/computer-science/internet-intro) | How the internet works, packets, DNS, IP addresses | Free | 3–4 hours |
| [CodePen](https://codepen.io) | A website where you can write HTML/CSS and see results instantly | Free | Use daily for practice |

### Key Concepts to Understand Deeply

- **HTML tag:** A piece of text inside angle brackets, like `<h1>Hello</h1>`. The `<h1>` is the opening tag, `</h1>` is the closing tag, and "Hello" is the content.
- **CSS selector:** A way to target HTML elements. `h1 { color: red; }` makes all `<h1>` elements red.
- **The DOM (Document Object Model):** The browser's internal representation of a webpage as a tree of objects. When you "Inspect Element," you are looking at the DOM.

### Project: Build a Personal Profile Page

Create a single HTML file called `about-me.html`. It should have:
- Your name as a big heading (`<h1>`)
- A paragraph about yourself (`<p>`)
- A photo of yourself (`<img>`)
- A list of your favorite things (`<ul>` and `<li>`)
- Links to your favorite websites (`<a>`)
- CSS that changes the background color, font, and makes the heading centered

Open this file in your browser. It will not be on the internet yet — it lives on your computer. That is okay. Every website starts this way.

---

## Phase 2: Programming Foundations (Weeks 8–18)

**Goal:** Learn to think like a programmer. This is the hardest phase. Do not rush it.

### What to Learn

- **JavaScript.** The programming language of the web. You will use it for the next several years.
- **Variables.** Named containers for data: `let name = "Juan"`
- **Data types.** Strings (text), numbers, booleans (true/false), arrays (lists), objects (collections of labeled data).
- **Functions.** Reusable blocks of code: `function greet(name) { return "Hello " + name; }`
- **Conditionals.** Making decisions: `if (age > 18) { ... } else { ... }`
- **Loops.** Doing things repeatedly: `for`, `while`.
- **Debugging.** Reading error messages, using `console.log()`, breaking problems into smaller pieces.
- **The command line (terminal).** Typing commands instead of clicking. This is intimidating at first but essential.
- **Git.** A tool that saves snapshots of your code so you can undo mistakes and collaborate.

### Resources

| Resource | What It Is | Cost | Time |
|----------|-----------|------|------|
| [freeCodeCamp — JavaScript Algorithms and Data Structures](https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/) | Free, interactive, comprehensive. Do every exercise. | Free | 60–80 hours |
| [The Odin Project — Foundations](https://www.theodinproject.com/paths/foundations/courses/foundations) | Free full-stack curriculum. The JavaScript section is excellent. | Free | 4–6 weeks |
| [JavaScript.info](https://javascript.info) | The best written JavaScript reference. Read it like a textbook. | Free | Read alongside freeCodeCamp |
| [Codecademy — Learn the Command Line](https://www.codecademy.com/learn/learn-the-command-line) | Interactive terminal practice | Free tier | 4–5 hours |
| [Oh Shit, Git!?](https://ohshitgit.com) | Friendly guide for when Git goes wrong | Free | Reference |
| [GitHub Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf) | One-page PDF of essential commands | Free | Print and keep nearby |

### Key Concepts to Understand Deeply

- **A variable is a box with a label.** `let x = 5` creates a box labeled "x" and puts 5 inside.
- **A function is a recipe.** It takes ingredients (parameters), follows steps, and produces a result (return value).
- **An array is a numbered list.** `["apple", "banana", "cherry"]` — "apple" is at index 0, "banana" at 1, "cherry" at 2.
- **An object is a labeled collection.** `{ name: "Juan", age: 30 }` — you access values by their label: `person.name` gives you `"Juan"`.
- **Scope.** Variables declared inside a function only exist inside that function. This prevents different parts of your code from accidentally interfering with each other.

### Project: Build a To-Do List App (Console Version)

Create a JavaScript file that runs in the browser console (or Node.js) and allows you to:
- Add a task to a list
- Mark a task as complete
- Delete a task
- Print all tasks

Do not build a visual interface yet. Just use `console.log()` and functions. The logic is what matters. Example:

```javascript
let tasks = [];

function addTask(title) {
  tasks.push({ title: title, done: false });
}

function markDone(index) {
  tasks[index].done = true;
}

function showTasks() {
  console.log("My Tasks:");
  tasks.forEach((task, i) => {
    console.log(i + ". " + (task.done ? "[x]" : "[ ]") + " " + task.title);
  });
}
```

### Project: Use Git for the First Time

1. Install Git.
2. In your terminal, navigate to your `learning-journey` folder.
3. Run `git init` to turn it into a Git repository.
4. Run `git add .` to stage your files.
5. Run `git commit -m "My first commit"` to save a snapshot.
6. Create a [GitHub](https://github.com) account.
7. Create a new repository and follow the instructions to push your code.

You have now backed up your code to the internet. This is what professional developers do dozens of times per day.

---

## Phase 3: Frontend Development (Weeks 19–28)

**Goal:** Build beautiful, interactive websites that run in the browser.

### What to Learn

- **HTML5 semantic elements.** `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>` — these describe the *meaning* of content, not just its appearance.
- **CSS layout.** Flexbox and CSS Grid — the modern way to arrange elements on a page.
- **Responsive design.** Making your site look good on phones, tablets, and desktops using media queries.
- **JavaScript in the browser.** The DOM API — selecting elements, listening for clicks, changing content dynamically.
- **React.** The most popular JavaScript library for building user interfaces. It lets you build websites from reusable "components" (like Lego bricks).
- **NPM.** The Node Package Manager — how you install JavaScript libraries written by other people.

### Resources

| Resource | What It Is | Cost | Time |
|----------|-----------|------|------|
| [freeCodeCamp — Responsive Web Design](https://www.freecodecamp.org/learn/2022/responsive-web-design/) | HTML and CSS certification | Free | 30–40 hours |
| [Flexbox Froggy](https://flexboxfroggy.com) | A game that teaches CSS Flexbox | Free | 1–2 hours |
| [Grid Garden](https://cssgridgarden.com) | A game that teaches CSS Grid | Free | 1–2 hours |
| [JavaScript30](https://javascript30.com) | 30 small vanilla JS projects in 30 days | Free | 30 days, 1 hour/day |
| [Scrimba — Learn React](https://scrimba.com/learn/learnreact) | Interactive React course with a fantastic teacher | Free | 10–12 hours |
| [React Official Tutorial](https://react.dev/learn) | The official React documentation | Free | 6–8 hours |
| [The Odin Project — Full Stack JavaScript](https://www.theodinproject.com/paths/full-stack-javascript) | Complete curriculum including React and Node.js | Free | 6–8 months total |

### Key Concepts to Understand Deeply

- **The DOM is a tree.** Every HTML element is a node. JavaScript can traverse this tree, find nodes, modify them, add new ones, or remove them.
- **Event listeners.** `button.addEventListener("click", handleClick)` — when the user clicks the button, run the `handleClick` function.
- **React state.** `const [count, setCount] = useState(0)` — a way to store data that, when changed, automatically updates the visible page.
- **React components.** A function that returns HTML-like JSX. `<Button color="red">Click me</Button>` — reusable, composable, predictable.
- **Props.** Data passed from a parent component to a child component. Like function parameters, but for UI pieces.

### Project: Build a Weather Dashboard

Use a free weather API (like [Open-Meteo](https://open-meteo.com)) to build a React app that:
- Has an input field for a city name
- Fetches weather data when the user submits
- Displays temperature, conditions, and a 5-day forecast
- Changes background color based on weather conditions
- Works on mobile phones (responsive design)

This project teaches you: React components, state, `fetch()` API, async/await, CSS layout, and responsive design.

### Project: Rebuild Your Profile Page in React

Take your Phase 1 profile page and rebuild it as a React application. Add:
- A dark mode toggle (uses React state)
- A contact form (uses event handlers)
- Multiple pages using React Router

---

## Phase 4: Backend & Databases (Weeks 29–38)

**Goal:** Understand what happens on the server when someone visits your website.

### What to Learn

- **Node.js.** Running JavaScript outside the browser, on a server.
- **HTTP.** The protocol browsers and servers use to talk. Methods: GET, POST, PUT, DELETE. Status codes: 200, 404, 500.
- **Express.js.** A lightweight framework for building server APIs in Node.js.
- **APIs (Application Programming Interfaces).** How different pieces of software talk to each other. Your frontend asks your backend for data via an API.
- **JSON.** The data format almost all modern APIs use.
- **Databases.** Why you need them, how they store data persistently.
- **Redis.** An in-memory database. Fast, simple, perfect for caching and small datasets.
- **SQL basics.** SELECT, INSERT, UPDATE, DELETE. You do not need to be an expert, but you should understand the concept.
- **Authentication.** How users prove who they are. Passwords, hashing, sessions, cookies, JWT tokens.

### Resources

| Resource | What It Is | Cost | Time |
|----------|-----------|------|------|
| [Node.js Official Docs](https://nodejs.org/en/docs/) | Documentation for running JS on servers | Free | Reference |
| [Express.js Getting Started](https://expressjs.com/en/starter/installing.html) | Build your first server | Free | 4–6 hours |
| [freeCodeCamp — Back End Development and APIs](https://www.freecodecamp.org/learn/back-end-development-and-apis/) | Node, Express, MongoDB certification | Free | 40–50 hours |
| [Redis University](https://university.redis.com) | Free courses on Redis from the creators | Free | 6–8 hours |
| [JWT.io Introduction](https://jwt.io/introduction) | How JSON Web Tokens work | Free | 30 minutes |
| [Mozilla MDN — HTTP Overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview) | How HTTP requests and responses work | Free | 2–3 hours |

### Key Concepts to Understand Deeply

- **Request/Response cycle.** The browser sends a *request*. The server processes it and sends back a *response*. Every interaction on the web follows this pattern.
- **Route.** A URL pattern on the server that handles specific requests. `GET /users` might return a list of users. `POST /users` might create a new user.
- **Middleware.** Functions that run between receiving a request and sending a response. They can check authentication, log requests, parse JSON bodies, etc.
- **Hashing passwords.** You never store passwords in plain text. You run them through a one-way mathematical function (like PBKDF2 or bcrypt) and store the result. Even if your database is stolen, the passwords are useless.
- **Environment variables.** Secret configuration values (API keys, database passwords) that are not stored in your code. They live in a `.env` file that is never committed to Git.

### Project: Build a REST API for Your To-Do App

Create a Node.js/Express server with these endpoints:
- `GET /tasks` — return all tasks
- `POST /tasks` — create a new task (body: `{ title: "..." }`)
- `PATCH /tasks/:id` — mark a task as done
- `DELETE /tasks/:id` — delete a task

Store tasks in a JSON file at first. Then upgrade to Redis. Then build a React frontend that talks to this API.

### Project: Add Authentication to Your API

Implement user registration and login:
- `POST /register` — hash the password, store the user
- `POST /login` — verify the password, create a session cookie
- Protect `GET /tasks` so users only see their own tasks

Use the exact same pattern as Juan's World: PBKDF2 for hashing, HMAC-SHA256 for session cookies.

---

## Phase 5: Full-Stack & The Juan's World Stack (Weeks 39–46)

**Goal:** Build complete, deployable applications using the same technologies as Juan's World.

### What to Learn

- **Next.js.** The React framework that combines frontend pages and backend API routes in one project.
- **Serverless functions.** Code that runs in the cloud only when needed. No server to manage.
- **Vercel.** Deploy Next.js apps with one click. Automatic HTTPS, global CDN, zero configuration.
- **Upstash Redis.** Managed Redis with a REST API, perfect for serverless.
- **Resend.** Sending emails from your application.
- **Markdown processing.** Using `gray-matter` and `marked` to turn Markdown files into HTML.
- **Frontend/Backend integration.** Your React components `fetch()` data from your API routes. The API routes read from Redis. The data flows full circle.

### Resources

| Resource | What It Is | Cost | Time |
|----------|-----------|------|------|
| [Next.js Learn Course](https://nextjs.org/learn) | Official interactive Next.js tutorial | Free | 8–10 hours |
| [Next.js Documentation](https://nextjs.org/docs) | The definitive reference. Read the App Router sections. | Free | Ongoing reference |
| [Vercel Documentation](https://vercel.com/docs) | How to deploy and configure Next.js on Vercel | Free | 2–3 hours |
| [Upstash Documentation](https://docs.upstash.com/redis) | How to connect to Redis from a Next.js app | Free | 1–2 hours |
| [Resend Documentation](https://resend.com/docs) | How to send emails from your API | Free | 1 hour |
| [Juan's World DevOps Manual](DEVOPS_MANUAL.md) | The comprehensive guide to this exact system | Free | Read it twice |

### Key Concepts to Understand Deeply

- **Server Components vs. Client Components (React/Next.js).** Some parts of your page run on the server (where they can access databases directly). Some parts run in the browser (where they can respond to user clicks). Knowing which is which prevents many bugs.
- **API Routes in Next.js.** Files in `app/api/.../route.ts` automatically become HTTP endpoints. No Express needed.
- **Build vs. Runtime.** When you deploy, Next.js "builds" your app once (generates optimized files). When a visitor arrives, the "runtime" executes your code. Some things only work at build time; some only at runtime.
- **Fallback strategies.** What happens when your primary database is down? The Juan's World pattern — Redis first, filesystem second, memory third — is a professional-grade approach to reliability.

### Project: Build a Blog Platform (Your Own Juan's World)

Create a Next.js application with:
- A homepage showing recent posts
- A page for each post (fetched from Redis)
- An admin login page
- A protected dashboard where admins can create/edit/delete posts
- Markdown support for post content
- An API key system so an external script (your "AI agent") can publish posts
- Deploy it to Vercel

This is a simplified version of Juan's World. If you can build this, you understand every core concept in the system.

### Project: Read and Modify Juan's World

Clone the Juan's World repository. Try to:
1. Run it locally (`npm install`, `npm run dev`).
2. Add a new static page to `public/`.
3. Add a new API route that returns a random quote.
4. Modify the diary page to show posts in a different order.
5. Add a new environment variable and use it in an API route.

If you can do all of these, you are no longer a beginner. You are a developer.

---

## Recommended Weekly Schedule (Part-Time)

If you can dedicate 10–15 hours per week, here is a sustainable rhythm:

| Day | Activity | Time |
|-----|----------|------|
| **Monday** | Read/watch theory (new concept) | 1 hour |
| **Tuesday** | Practice with interactive exercises | 1 hour |
| **Wednesday** | Work on your project | 1 hour |
| **Thursday** | Read documentation or source code | 1 hour |
| **Friday** | Work on your project + debug | 1 hour |
| **Saturday** | Deep project work or catch-up | 2–3 hours |
| **Sunday** | Rest, or review what you learned | 0–1 hour |

**The 20-minute rule:** If you are stuck on a bug or concept for more than 20 minutes, write down exactly what you do not understand and ask for help. Do not bang your head against the wall for hours. Post on [Stack Overflow](https://stackoverflow.com), ask in a Discord community, or use ChatGPT/Claude to explain the concept. Then close the explanation and try to implement it yourself.

---

## Communities and Support

You do not learn to code alone. Join these communities:

| Community | Where | Why Join |
|-----------|-------|----------|
| **freeCodeCamp Forum** | [forum.freecodecamp.org](https://forum.freecodecamp.org) | Friendly, beginner-focused, no stupid questions |
| **The Odin Project Discord** | [discord.gg/theodinproject](https://discord.gg/theodinproject) | Active, supportive, curriculum-aligned help |
| **Reactiflux Discord** | [reactiflux.com](https://reactiflux.com) | Largest React community, great for React/Next.js questions |
| **Dev.to** | [dev.to](https://dev.to) | Blog posts from developers at all levels. Read one article per day. |
| **r/learnprogramming** | [reddit.com/r/learnprogramming](https://reddit.com/r/learnprogramming) | Huge community, good for motivation and career advice |

---

## Mindset: The Difficulty Curve

Learning to code is not linear. Here is what to expect:

- **Months 1–2:** Everything is new and exciting. You are learning fast.
- **Months 3–4:** The "valley of despair." You know enough to know how much you do not know. Projects feel harder. This is normal. Keep going.
- **Months 5–6:** Things start clicking. You can build small projects without tutorials.
- **Months 7–9:** You can read documentation and figure things out independently.
- **Months 10–12:** You can build a full application from scratch and deploy it.

The people who succeed are not the smartest. They are the most consistent.

---

## When to Start Applying for Jobs

If your goal is employment as a developer:

- **Junior Frontend Developer:** After Phase 3 (Frontend). You need a portfolio of 3–4 React projects.
- **Junior Full-Stack Developer:** After Phase 5. You need a portfolio of 2–3 full-stack projects with authentication, databases, and deployment.
- **What employers want to see:**
  - A GitHub profile with clean, documented code
  - A personal website that hosts your projects
  - Projects that solve real problems (not just tutorial copies)
  - Evidence that you can learn (you taught yourself, after all)

Start applying before you feel "ready." The interview process itself is part of the learning.

---

*Good luck. The hardest part is starting. You have already done that by reading this far.*
