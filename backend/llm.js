// event-llm-dispatcher.js
const readline = require("readline");
const { EventEmitter } = require("events");

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "llama3.2:1b";

// ---------- Startup check ----------
async function checkOllama() {
    console.log("[startup] Ollama connection check kar raha hoon...");
    try {
        const res = await fetch("http://localhost:11434/api/tags");
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        const models = (data.models || []).map((m) => m.name);
        console.log("[startup] Ollama chal raha hai ✅ Models:", models);
        if (!models.some((m) => m.includes("llama3.2"))) {
            console.log(`[startup] ⚠️  "${MODEL}" nahi mila. Chalao: ollama pull llama3.2`);
        }
    } catch (err) {
        console.error("[startup] ❌ Ollama se connect nahi ho paya:", err.message);
        console.error('[startup] "ollama serve" chalao pehle.');
        process.exit(1);
    }
}

// ---------- Ollama caller ----------
async function callOllama(prompt) {
    const res = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, prompt, stream: false }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ollama error ${res.status}: ${text}`);
    }
    const data = await res.json();
    return (data.response || "").trim();
}

// ---------- Event bus ----------
const bus = new EventEmitter();

// ---------- TASK STORE (status tracking ka core) ----------
const tasks = new Map(); // id -> { id, query, type, status, result, error, createdAt }

function createTask(query, type) {
    const id = ++createTask.counter || (createTask.counter = 1);
    const task = {
        id: createTask.counter,
        query,
        type,
        status: "queued", // queued -> processing -> done | error
        result: null,
        error: null,
        createdAt: new Date(),
    };
    tasks.set(task.id, task);
    return task;
}

function updateTask(id, patch) {
    const t = tasks.get(id);
    if (!t) return;
    Object.assign(t, patch);
}

function lastTask() {
    const ids = [...tasks.keys()];
    if (ids.length === 0) return null;
    return tasks.get(ids[ids.length - 1]);
}

function formatStatus(t) {
    if (!t) return "Abhi tak koi kaam diya nahi hai tumne.";
    const base = `Task #${t.id} ("${t.query}") — type: ${t.type} — status: ${t.status}`;
    if (t.status === "done") return `${base}\nResult: ${t.result}`;
    if (t.status === "error") return `${base}\nError: ${t.error}`;
    return `${base}\n(abhi chal raha hai, thoda wait karo)`;
}

// ---------- Queue (worker per task-type) ----------
class TaskQueue {
    constructor(name, handler) {
        this.name = name;
        this.handler = handler;
        this.queue = [];
        this.busy = false;
    }

    push(task) {
        this.queue.push(task);
        this._drain();
    }

    async _drain() {
        if (this.busy) return;
        this.busy = true;

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            updateTask(task.id, { status: "processing" });
            bus.emit("task:started", task);
            try {
                const result = await this.handler(task);
                updateTask(task.id, { status: "done", result });
                bus.emit("task:done", { ...task, result });
            } catch (err) {
                updateTask(task.id, { status: "error", error: err.message });
                bus.emit("task:error", { ...task, error: err.message });
            }
            await new Promise((r) => setImmediate(r));
        }
        this.busy = false;
    }
}

// ---------- Handlers ----------
async function handleSearchTask(task) {
    const prompt = `Answer using your best knowledge (pretend live search): "${task.query}"`;
    return callOllama(prompt);
}
async function handleCodeTask(task) {
    const prompt = `Write code for this request, with brief comments:\n\n${task.query}`;
    return callOllama(prompt);
}
async function handleGeneralTask(task) {
    return callOllama(task.query);
}

const queues = {
    search: new TaskQueue("search", handleSearchTask),
    code: new TaskQueue("code", handleCodeTask),
    general: new TaskQueue("general", handleGeneralTask),
};

// ---------- Intent detection: naya task vs status-check vs normal chat ----------
async function detectIntent(userInput) {
    const prompt = `Classify the user's message into exactly one word:
- "status" -> user is asking about progress/result of a previous task (e.g. "mera kaam hua?", "status batao", "kya result aaya")
- "task" -> user wants a NEW piece of work done (search something, write code, do research etc.)
- "chat" -> normal conversation, greeting, or question that doesn't need queuing

Reply with ONLY one word: status, task, or chat.

Message: "${userInput}"`;
    const raw = (await callOllama(prompt)).toLowerCase();
    if (raw.includes("status")) return "status";
    if (raw.includes("task")) return "task";
    return "chat";
}

async function classifyTaskType(userInput) {
    const prompt = `Classify into exactly one word: "search", "code", or "general".
Reply with ONLY that single word.

Request: "${userInput}"`;
    const raw = (await callOllama(prompt)).toLowerCase();
    if (raw.includes("search")) return "search";
    if (raw.includes("code")) return "code";
    return "general";
}

// ---------- Notify user when background task finishes (even mid-chat) ----------
bus.on("task:done", (t) => {
    console.log(`\n🔔 [background] Task #${t.id} complete ho gaya!\nResult: ${t.result}\n`);
    rlPromptSafe();
});
bus.on("task:error", (t) => {
    console.log(`\n🔔 [background] Task #${t.id} me error aaya: ${t.error}\n`);
    rlPromptSafe();
});

let rl; // set in main()
function rlPromptSafe() {
    if (rl) rl.prompt(true);
}

// ---------- Main handler for each user message ----------
async function handleUserMessage(input) {
    const intent = await detectIntent(input);

    if (intent === "status") {
        // agar specific id mention kiya ho (#3, task 3, etc) to wahi dhundo, warna latest
        const idMatch = input.match(/#?(\d+)/);
        const t = idMatch ? tasks.get(Number(idMatch[1])) : lastTask();
        console.log(formatStatus(t));
        return;
    }

    if (intent === "task") {
        const type = await classifyTaskType(input);
        const task = createTask(input, type);
        queues[type].push(task);
        console.log(`Theek hai, kaam pakad liya (Task #${task.id}, type: ${type}). Kaam chal raha hai background me — jab poochoge "status" to bata dunga. Tab tak aur baat karte raho.`);
        return;
    }

    // normal chat -> seedha reply, blocking nahi kyunki koi queue nahi lagi
    const reply = await callOllama(input);
    console.log(reply);
}

// ---------- CLI ----------
async function main() {
    await checkOllama();

    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('\nReady! Kaam do, chat karo, ya "status" pucho. Exit ke liye "exit".');
    rl.setPrompt("> ");
    rl.prompt();

    rl.on("line", async (line) => {
        const input = line.trim();
        if (input.toLowerCase() === "exit") {
            rl.close();
            process.exit(0);
        }
        if (!input) return rl.prompt();

        try {
            await handleUserMessage(input);
        } catch (err) {
            console.error("[error]", err.message);
        }
        rl.prompt();
    });
}

main().catch((err) => {
    console.error("[fatal]", err);
    process.exit(1);
});