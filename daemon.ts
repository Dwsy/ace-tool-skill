import { spawn } from "bun";
import { parseArgs } from "util";

// 加载环境变量
const API_KEY = process.env.ACE_API_KEY;
const BASE_URL = process.env.ACE_BASE_URL;
const PORT = parseInt(process.env.ACE_PORT || "4231");

if (!API_KEY || !BASE_URL) {
  console.error("Missing configuration in .env");
  process.exit(1);
}

// 启动 ace-tool 子进程
const aceProcess = spawn({
  cmd: ["ace-tool", "--base-url", BASE_URL, "--token", API_KEY, "--enable-log"],
  stdin: "pipe",
  stdout: "pipe",
  stderr: "inherit", 
});

console.log(`Daemon started. Ace-tool PID: ${aceProcess.pid}`);

// JSON-RPC 请求队列
const pendingRequests = new Map();
let messageBuffer = "";
// const stdinWriter = aceProcess.stdin.getWriter(); // 删除这行

// 封装发送函数
async function sendRpc(method, params, id = null) {
  if (!id) id = Math.floor(Math.random() * 1000000);
  const req = { jsonrpc: "2.0", id, method, params };
  // 直接写入
  aceProcess.stdin.write(new TextEncoder().encode(JSON.stringify(req) + "\n"));
  await aceProcess.stdin.flush();
  
  return new Promise((resolve, reject) => {
    // 30秒超时
    const timeout = setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error(`Timeout calling ${method}`));
      }
    }, 30000);

    pendingRequests.set(id, { 
      resolve: (res) => { clearTimeout(timeout); resolve(res); },
      reject: (err) => { clearTimeout(timeout); reject(err); }
    });
  });
}

// 自动执行 Initialize
(async () => {
  try {
    console.log("Initializing MCP handshake...");
    await sendRpc("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "pi-ace-bridge", version: "1.0.0" }
    });
    // 发送 initialized 通知 (不需要响应)
    aceProcess.stdin.write(new TextEncoder().encode(JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized"
    }) + "\n"));
    await aceProcess.stdin.flush();
    console.log("MCP Initialized successfully.");
  } catch (e) {
    console.error("MCP Initialization failed:", e);
    // 这里不退出，可能还在重试中？或者让 subsequent calls fail
  }
})();

// 处理 ace-tool 的 stdout (JSON-RPC 响应)
async function readStdout() {
  const reader = aceProcess.stdout.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    messageBuffer += chunk;

    const lines = messageBuffer.split("\n");
    // 保留最后一个可能不完整的片段
    messageBuffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.id && pendingRequests.has(msg.id)) {
          const { resolve, reject } = pendingRequests.get(msg.id);
          pendingRequests.delete(msg.id);
          if (msg.error) {
            reject(msg.error);
          } else {
            resolve(msg.result);
          }
        }
      } catch (e) {
        console.error("Failed to parse ace-tool output:", line);
      }
    }
  }
}

readStdout().catch(console.error);

// 启动 HTTP 服务器
Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // 健康检查
    if (url.pathname === "/health") {
      return new Response("OK");
    }

    // 调用工具接口
    if (url.pathname === "/call" && req.method === "POST") {
      try {
        const body = await req.json();
        const { method, params } = body;
        
        const result = await sendRpc(method, params);

        return new Response(JSON.stringify({ result }), {
          headers: { "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Ace-tool Bridge Server listening on port ${PORT}`);
