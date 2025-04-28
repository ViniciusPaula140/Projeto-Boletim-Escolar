// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY);
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_KEY;
var supabase = createClient(supabaseUrl, supabaseKey);

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/alunos", async (req, res) => {
    const { name, class: turma, shift } = req.body;
    const { data, error } = await supabase.from("students").insert([{ name, class: turma, shift }]).select();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  });
  app2.get("/api/alunos", async (req, res) => {
    const { data, error } = await supabase.from("students").select("*").order("id", { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });
  app2.get("/api/alunos/:id", async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("students").select("*").eq("id", id).single();
    if (error) return res.status(404).json({ error: error.message });
    res.json(data);
  });
  app2.put("/api/alunos/:id", async (req, res) => {
    const { id } = req.params;
    const { name, class: turma, shift } = req.body;
    const updateObj = { name, shift };
    updateObj["class"] = turma;
    const { data, error } = await supabase.from("students").update(updateObj).eq("id", id).select();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  });
  app2.delete("/api/alunos/:id", async (req, res) => {
    const { id } = req.params;
    const studentId = Number(id);
    const { error: gradesError } = await supabase.from("grades").delete().eq("student_id", studentId);
    if (gradesError) {
      console.error("Erro ao deletar notas do aluno:", gradesError.message);
      return res.status(400).json({ error: gradesError.message });
    }
    console.log("Notas deletadas para o aluno", studentId);
    const { error: studentError } = await supabase.from("students").delete().eq("id", id);
    if (studentError) return res.status(400).json({ error: studentError.message });
    res.json({ success: true });
  });
  app2.get("/api/subjects", async (req, res) => {
    const { data, error } = await supabase.from("subjects").select("*").order("id", { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });
  app2.get("/api/units", async (req, res) => {
    const { data, error } = await supabase.from("units").select("*").order("id", { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });
  app2.get("/api/activities", async (req, res) => {
    const { data, error } = await supabase.from("activities").select("*").order("id", { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });
  app2.get("/api/alunos/:id/grades", async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("grades").select("*").eq("student_id", id);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });
  app2.post("/api/grades", async (req, res) => {
    const { value, student_id, subject_id, unit_id, activity_id } = req.body;
    const { data, error } = await supabase.from("grades").insert([{ value, student_id, subject_id, unit_id, activity_id }]).select();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  });
  app2.put("/api/grades/:id", async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;
    const { data, error } = await supabase.from("grades").update({ value }).eq("id", id).select();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  });
  app2.delete("/api/grades/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("grades").delete().eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });
  app2.post("/api/grades/batch", async (req, res) => {
    const { grades } = req.body;
    if (!Array.isArray(grades)) {
      return res.status(400).json({ error: "Formato inv\xE1lido" });
    }
    let errors = [];
    for (const grade of grades) {
      const { student_id, subject_id, unit_id, activity_id, value } = grade;
      const { data: existing, error: selectError } = await supabase.from("grades").select("id").eq("student_id", student_id).eq("subject_id", subject_id).eq("unit_id", unit_id).eq("activity_id", activity_id).maybeSingle();
      if (selectError) {
        errors.push(selectError.message);
        continue;
      }
      if (existing && existing.id) {
        const { error: updateError } = await supabase.from("grades").update({ value }).eq("id", existing.id);
        if (updateError) errors.push(updateError.message);
      } else {
        const { error: insertError } = await supabase.from("grades").insert([{ student_id, subject_id, unit_id, activity_id, value }]);
        if (insertError) errors.push(insertError.message);
      }
    }
    if (errors.length > 0) {
      return res.status(500).json({ error: errors.join("; ") });
    }
    res.status(200).json({ success: true });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor": [
            "react",
            "react-dom",
            "react-router-dom",
            "@tanstack/react-query",
            "chart.js",
            "recharts"
          ],
          "ui": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-toast"
          ],
          "utils": [
            "date-fns",
            "zod",
            "clsx",
            "tailwind-merge"
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1e3,
    sourcemap: true
  },
  server: {
    port: 3e3,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.get("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `N\xE3o foi poss\xEDvel encontrar o diret\xF3rio de build: ${distPath}, certifique-se de construir o cliente primeiro`
    );
  }
  app2.use(express.static(distPath));
  app2.get("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/config.ts
var config = {
  // URLs
  backendUrl: process.env.NODE_ENV === "production" ? process.env.BACKEND_URL || "https://seu-backend.onrender.com" : "http://localhost:5000",
  // Environment
  isProduction: process.env.NODE_ENV === "production",
  // Server
  port: 5e3,
  // Database
  databaseUrl: process.env.DATABASE_URL,
  // Session
  sessionSecret: process.env.SESSION_SECRET,
  // Ping Service
  pingInterval: 14 * 60 * 1e3,
  // 14 minutes in milliseconds
  pingEnabled: process.env.NODE_ENV === "production",
  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
  // Security
  corsOrigin: process.env.CORS_ORIGIN || "*"
};

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.get("/health", async (_req, res) => {
  try {
    const healthData = {
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      // Adiciona informações do sistema
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version
      },
      // Adiciona informações de performance
      performance: {
        eventLoopLag: process.hrtime()
      }
    };
    res.status(200).json(healthData);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var pingService = async () => {
  try {
    const response = await fetch(`${config.backendUrl}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log("Ping successful:", {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        uptime: data.uptime,
        memory: data.memory
      });
    } else {
      console.error("Ping failed:", {
        status: response.status,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  } catch (error) {
    console.error("Ping error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
};
if (config.pingEnabled) {
  console.log("Starting ping service...");
  setInterval(pingService, config.pingInterval);
  pingService();
}
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || config.port;
  server.listen(port, () => {
    console.log("\n==========================================");
    console.log("\u{1F680} Servidor iniciado com sucesso!");
    console.log(`\u{1F4E1} Acesse: http://localhost:${port}`);
    console.log(`\u{1F30D} Ambiente: ${process.env.NODE_ENV}`);
    console.log(`\u23F0 Ping Service: ${config.pingEnabled ? "Ativado" : "Desativado"}`);
    console.log("==========================================\n");
  });
})();
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.originalUrl}`);
  next();
});
