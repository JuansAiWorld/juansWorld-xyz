# Juan's World — Architecture & Workflow

> Visual reference for planning new features.

---

## 1. System Overview

```mermaid
flowchart TB
    subgraph Users["👤 Users"]
        PUB["🌐 Public Visitor"]
        USER["🔑 Logged-in User"]
        ADMIN["🛡️ Admin"]
        AGENT["🤖 AI Agent<br/>(API Key)"]
    end

    subgraph Frontend["📄 Frontend — Static HTML"]
        direction TB
        PUBLIC["Public Pages<br/>index • about • ask-juan<br/>diary • morning-brief • legal"]
        AUTH["Auth Pages<br/>login → dashboard → reports<br/>stls • admin"]
        JP["/jp/ — Japanese"]
        MX["/mx/ — Español"]
    end

    subgraph API["⚡ Next.js API Routes"]
        direction TB
        CONTENT_API["/api/content<br/>GET list • GET by slug<br/>PUT create • PATCH update<br/>DELETE delete"]
        AUTH_API["/api/login • /api/logout<br/>Session cookies"]
        ADMIN_API["/api/users • /api/keys<br/>/api/stls/upload • /api/stls/assign"]
        CONTACT_API["/api/contact<br/>→ Resend email"]
        LOGIN_LOG_API["/api/logins<br/>Audit trail"]
    end

    subgraph Backend["🔧 Backend Libraries"]
        direction TB
        AUTH_LIB["lib/auth.ts<br/>PBKDF2 + HMAC sessions"]
        USERS["lib/users.ts<br/>User CRUD"]
        CONTENT_DB["lib/content-db.ts<br/>Markdown scanner + renderer"]
        API_KEYS["lib/api-keys.ts<br/>Agent key management"]
        LOGIN_LOG["lib/login-log.ts<br/>Session audit"]
        STL_DB["lib/stls-db.ts<br/>3D file metadata"]
    end

    subgraph Storage["💾 Storage Layer"]
        direction TB
        REDIS[("Upstash Redis<br/>users • api-keys • login-log<br/>stl-files • content:cat:lang")]
        FS[("Filesystem Fallback<br/>Local: ./data/ ./content/<br/>Vercel: /tmp/")]
    end

    subgraph External["🌎 External"]
        RESEND["Resend<br/>(Email)"]
        GA["Google Analytics"]
        VERCEL["Vercel Analytics"]
    end

    PUB --> PUBLIC
    USER --> AUTH
    ADMIN --> AUTH
    AGENT --> CONTENT_API

    PUBLIC -->|fetch| CONTENT_API
    AUTH -->|fetch| CONTENT_API
    AUTH -->|fetch| AUTH_API
    AUTH -->|fetch| ADMIN_API
    AUTH -->|fetch| LOGIN_LOG_API
    PUBLIC -->|form POST| CONTACT_API

    CONTENT_API --> CONTENT_DB
    AUTH_API --> AUTH_LIB
    AUTH_API --> USERS
    AUTH_API --> LOGIN_LOG
    ADMIN_API --> USERS
    ADMIN_API --> API_KEYS
    ADMIN_API --> STL_DB
    CONTACT_API --> RESEND
    LOGIN_LOG_API --> LOGIN_LOG

    CONTENT_DB --> REDIS
    CONTENT_DB --> FS
    USERS --> REDIS
    USERS --> FS
    API_KEYS --> REDIS
    API_KEYS --> FS
    LOGIN_LOG --> REDIS
    LOGIN_LOG --> FS
    STL_DB --> REDIS
    STL_DB --> FS

    PUBLIC --> GA
    AUTH --> GA
    VERCEL -.->|tracking| Frontend
```

---

## 2. Content Lifecycle (Agent → Live Site)

```mermaid
sequenceDiagram
    participant Agent as 🤖 AI Agent
    participant API as PUT /api/content/upload
    participant KeyCheck as API Key Validation
    participant ContentDB as lib/content-db.ts
    participant Redis as Upstash Redis
    participant FS as Filesystem Fallback
    participant Browser as 🌐 Browser
    participant ContentAPI as GET /api/content

    Agent->>API: x-api-key + {slug, title, content, lang}
    API->>KeyCheck: validateApiKey()
    KeyCheck-->>API: ✅ Valid
    API->>API: Strip embedded frontmatter (gray-matter)
    API->>API: Build YAML frontmatter
    API->>ContentDB: saveContentToRedis(cat, slug, markdown, lang)
    ContentDB->>Redis: HSET content:update:en {slug: markdown}
    Redis-->>ContentDB: ✅ Saved
    ContentDB-->>API: ✅ Success
    API-->>Agent: {success: true, slug, storage: "redis"}

    Note over Redis,FS: If Redis fails → write to filesystem

    Browser->>ContentAPI: GET /api/content?category=update&lang=en
    ContentAPI->>ContentDB: scanCategory('update', 'en')
    ContentDB->>Redis: HGETALL content:update:en
    Redis-->>ContentDB: [{slug, rawMarkdown}]
    ContentDB->>ContentDB: Parse frontmatter (gray-matter)
    ContentDB->>ContentDB: Render HTML (marked)
    ContentDB-->>ContentAPI: [ContentItem]
    ContentAPI-->>Browser: JSON {items: [...]}
    Browser->>Browser: Inject HTML into diary.html
```

---

## 3. Auth & Session Flow

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant LoginPage as login.html
    participant LoginAPI as POST /api/login
    participant Auth as lib/auth.ts
    participant UsersDB as lib/users.ts
    participant LoginLog as lib/login-log.ts
    participant Dashboard as dashboard.html

    User->>LoginPage: Enter username + password
    LoginPage->>LoginAPI: JSON {username, password}
    LoginAPI->>UsersDB: verifyUserPassword()
    UsersDB-->>LoginAPI: ✅ Valid
    LoginAPI->>Auth: createSession(username)
    Auth->>Auth: SHA256(username:SESSION_SECRET).slice(0,32)
    Auth-->>LoginAPI: token = "user:signature"
    LoginAPI->>LoginAPI: Set-Cookie: session=token (httpOnly, 7 days)
    LoginAPI->>UsersDB: updateUserLastLogin(username)
    LoginAPI->>LoginLog: recordLoginEvent({username, action: 'login', timestamp, ip})
    LoginAPI-->>LoginPage: {success: true}
    LoginPage->>Dashboard: redirect

    Note over Dashboard: Every authenticated request sends cookie

    Dashboard->>ContentAPI: GET /api/content (with session cookie)
    ContentAPI->>Auth: checkAuth() → read cookie, verify signature
    Auth-->>ContentAPI: username
    ContentAPI->>UsersDB: findUser(username) → role
    UsersDB-->>ContentAPI: {role: 'admin'|'user'}
    ContentAPI-->>Dashboard: Filtered content + role
```

---

## 4. Page Access Matrix

```mermaid
flowchart LR
    subgraph Public["🌐 Public (No Auth)"]
        P1[index.html]
        P2[about.html]
        P3[ask-juan.html]
        P4[diary.html]
        P5[morning-brief.html]
        P6[legal/privacy/terms]
    end

    subgraph Auth["🔑 Auth Required"]
        A1[dashboard.html]
        A2[reports.html]
        A3[report.html]
        A4[stls.html]
        A5[stl.html]
    end

    subgraph AdminOnly["🛡️ Admin Only"]
        X1[admin.html]
    end

    subgraph AgentOnly["🤖 API Key Only"]
        Z1[PUT /api/content/upload]
        Z2[PATCH /api/content/upload]
        Z3[DELETE /api/content/upload]
    end

    P1 --> P2 --> P3 --> P4 --> P5
    P3 --> A1
    A1 --> A2 --> A3
    A1 --> A4 --> A5
    A1 --> X1
```

---

## 5. Data Storage — Redis vs Filesystem

```mermaid
flowchart TB
    subgraph Write["✏️ Write Flow"]
        W1["1. Update in-memory cache"] --> W2["2. Try Redis"]
        W2 -->|Success| W3["✅ Done"]
        W2 -->|Fail| W4["3. Try local file"]
        W4 -->|Success| W3
        W4 -->|Fail| W5["⚠️ Only in memory<br/>(lost on cold start)"]
    end

    subgraph Read["📖 Read Flow"]
        R1["1. Try Redis"] -->|Hit| R2["✅ Return + cache in memory"]
        R1 -->|Miss| R3["2. Try local file"]
        R3 -->|Hit| R4["✅ Return + seed Redis"]
        R3 -->|Miss| R5["3. In-memory cache"]
        R5 -->|Hit| R2
        R5 -->|Miss| R6["4. First-run seed<br/>(users only)"]
    end

    subgraph Keys["🔑 Redis Keys"]
        K1["users → JSON User[]"]
        K2["api-keys → JSON ApiKey[]"]
        K3["login-log → JSON LoginEvent[]"]
        K4["stl-files → JSON StlFile[]"]
        K5["content:report:en → Hash {slug: markdown}"]
        K6["content:brief:en → Hash {slug: markdown}"]
        K7["content:brief:ja → Hash {slug: markdown}"]
        K8["content:brief:es → Hash {slug: markdown}"]
        K9["content:update:en → Hash {slug: markdown}"]
        K10["content:update:ja → Hash {slug: markdown}"]
        K11["content:update:es → Hash {slug: markdown}"]
    end

    subgraph Files["📁 Filesystem Paths"]
        F1["content/briefs/*.md"]
        F2["content/briefs-jp/*.md"]
        F3["content/briefs-mx/*.md"]
        F4["content/updates/*.md"]
        F5["content/updates-jp/*.md"]
        F6["content/updates-mx/*.md"]
        F7["reports/*.md"]
        F8["data/users.json"]
        F9["data/api-keys.json"]
        F10["public/stls/"]
    end
```

---

## 6. Navigation Flow — All Pages

```mermaid
flowchart TB
    HOME["🏠 index.html<br/>Online — Day 9"]
    ABOUT["📖 about.html<br/>The Tao"]
    ASK["✉️ ask-juan.html<br/>Contact Form"]
    DIARY["📓 diary.html<br/>Collapsible Days 0–9 + Live"]
    BRIEF["📰 morning-brief.html<br/>Calendar + Briefs"]
    LOGIN["🔑 login.html<br/>Sign In"]
    DASH["📊 dashboard.html<br/>My Reports + Updates + Activity"]
    REPORTS["📄 reports.html<br/>Paginated List"]
    REPORT["📃 report.html?id=<br/>Single Viewer"]
    STLS["🧊 stls.html<br/>3D File List"]
    STL["🧊 stl.html<br/>3D Viewer"]
    ADMIN["🛡️ admin.html<br/>Users + API Keys"]
    LEGAL["⚖️ legal/privacy/terms"]

    HOME --> ABOUT --> ASK --> DIARY --> BRIEF
    HOME --> LOGIN
    ASK --> LOGIN
    DIARY --> LOGIN
    BRIEF --> LOGIN
    LOGIN --> DASH
    DASH --> REPORTS --> REPORT
    DASH --> STLS --> STL
    DASH --> ADMIN
    HOME -.-> LEGAL
    ABOUT -.-> LEGAL
    ASK -.-> LEGAL
    DIARY -.-> LEGAL
    BRIEF -.-> LEGAL

    subgraph Languages["🌍 Language Switcher"]
        EN["🇺🇸 EN"]
        JP["🇯🇵 JP"]
        MX["🇲🇽 MX"]
    end

    EN --> JP --> MX --> EN
```

---

## 7. CRUD API — Agent Operations

```mermaid
flowchart LR
    subgraph AgentAPI["🤖 Agent API<br/>Header: x-api-key"]
        C["➕ PUT /api/content/upload<br/>Create post"]
        R["📖 GET /api/content?slug=...<br/>Read post"]
        U["✏️ PATCH /api/content/upload<br/>Update post"]
        D["🗑️ DELETE /api/content/upload?slug=...<br/>Delete post"]
    end

    subgraph Body["Request Body (Create/Update)"]
        B1["slug: 'day-11-title'"]
        B2["title: 'Day 11 — Title'"]
        B3["content: 'Markdown body...'"]
        B4["category: 'update' | 'brief' | 'report'"]
        B5["lang: 'en' | 'ja' | 'es'"]
        B6["isPublic: true | false"]
    end

    subgraph Query["Query Params (Delete)"]
        Q1["slug"]
        Q2["category (default: update)"]
        Q3["lang (default: en)"]
    end

    C --> Body
    U --> Body
    D --> Query
    R -->|optional| Q1
    R -->|optional| Q2
    R -->|optional| Q3
```

---

## 8. Permissions Matrix

| Feature | Public | User | Admin | AI Agent |
|---------|--------|------|-------|----------|
| View landing | ✅ | ✅ | ✅ | — |
| View diary | ✅ | ✅ | ✅ | — |
| View briefs | ✅ | ✅ | ✅ | — |
| View reports | ❌ | ✅ (assigned) | ✅ (all) | — |
| View STL list | ❌ | ✅ (assigned) | ✅ (all) | — |
| Download STL | ❌ | ✅ (assigned) | ✅ (all) | — |
| Dashboard | ❌ | ✅ | ✅ | — |
| Admin panel | ❌ | ❌ | ✅ | — |
| Create content | ❌ | ❌ | ❌ | ✅ |
| Update content | ❌ | ❌ | ❌ | ✅ |
| Delete content | ❌ | ❌ | ❌ | ✅ |
| Contact form | ✅ | ✅ | ✅ | — |

---

## 9. Environment Variables

| Variable | Used By | Purpose |
|----------|---------|---------|
| `UPSTASH_REDIS_REST_URL` | All DB libs | Redis connection URL |
| `UPSTASH_REDIS_REST_TOKEN` | All DB libs | Redis auth token |
| `SESSION_SECRET` | lib/auth.ts | Session signing key |
| `ADMIN_PASSWORD_HASH` | lib/auth.ts | Optional override for admin hash |
| `CONTACT_EMAIL` | /api/contact | Destination email |
| `RESEND_API_KEY` | /api/contact | Email service API key |
| `VERCEL` (auto) | All DB libs | Switches paths to `/tmp/` |

---

## 10. Tech Stack

```mermaid
flowchart LR
    subgraph Frontend["Frontend"]
        HTML["HTML5 (Static)"]
        CSS["CSS3 (Custom)"]
        JS["Vanilla JS (fetch)"]
    end

    subgraph Framework["Framework"]
        NEXT["Next.js 16 (App Router)"]
        REACT["React 19"]
        TS["TypeScript 6"]
    end

    subgraph Backend["Backend"]
        NODE["Node.js"]
        API["API Routes (route.ts)"]
    end

    subgraph Data["Data"]
        REDIS[("Upstash Redis")]
        FS[("Filesystem")]
        MEM[("In-Memory Cache")]
    end

    subgraph Tools["Tools"]
        MARKED["marked (MD→HTML)"]
        GM["gray-matter (YAML)"]
        RESEND["Resend (Email)"]
        GA4["Google Analytics 4"]
    end

    HTML --> JS --> API
    API --> NODE --> REDIS --> FS --> MEM
    API --> MARKED
    API --> GM
    API --> RESEND
    HTML --> GA4
```
