import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { config } from "./config";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      // Adiciona informações do sistema
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
      },
      // Adiciona informações de performance
      performance: {
        eventLoopLag: process.hrtime(),
      }
    };
    res.status(200).json(healthData);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Ping service to keep the server alive
const pingService = async () => {
  try {
    const response = await fetch(`${config.backendUrl}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('Ping successful:', {
        timestamp: new Date().toISOString(),
        uptime: data.uptime,
        memory: data.memory,
      });
    } else {
      console.error('Ping failed:', {
        status: response.status,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: unknown) {
    console.error('Ping error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
};

// Start ping service if enabled
if (config.pingEnabled) {
  console.log('Starting ping service...');
  // Ping every configured interval
  setInterval(pingService, config.pingInterval);
  // Initial ping
  pingService();
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // 1. Registre as rotas de API primeiro
  const server = await registerRoutes(app);

  // 2. Middleware global de erro
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // 3. Só depois, sirva arquivos estáticos/catch-all
  // é importante configurar o vite apenas em ambiente de desenvolvimento e após
  // configurar todas as outras rotas para que a rota catch-all
  // não interfira com as outras rotas
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // SEMPRE servir a aplicação na porta 5000
  // isso serve tanto a API quanto o cliente.
  const port = process.env.PORT || config.port;
  server.listen(port, () => {
    console.log('\n==========================================');
    console.log('🚀 Servidor iniciado com sucesso!');
    console.log(`📡 Acesse: http://localhost:${port}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`⏰ Ping Service: ${config.pingEnabled ? 'Ativado' : 'Desativado'}`);
    console.log('==========================================\n');
  });
})();

app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.originalUrl}`);
  next();
});
