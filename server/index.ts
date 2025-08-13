// import express, { type Request, Response, NextFunction } from "express";
// import { registerRoutes } from "./routes";
// import { setupVite, serveStatic, log } from "./vite";

// const app = express();

// // Increase JSON payload size limit for image uploads (50MB)
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// app.use((req, res, next) => {
//   const start = Date.now();
//   const path = req.path;
//   let capturedJsonResponse: Record<string, any> | undefined = undefined;
//   const originalResJson = res.json;
//   res.json = function (bodyJson, ...args) {
//     capturedJsonResponse = bodyJson;
//     return originalResJson.apply(res, [bodyJson, ...args]);
//   };
//   res.on("finish", () => {
//     const duration = Date.now() - start;
//     if (path.startsWith("/api")) {
//       let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
//       if (capturedJsonResponse) {
//         logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
//       }
//       if (logLine.length > 80) {
//         logLine = logLine.slice(0, 79) + "…";
//       }
//       log(logLine);
//     }
//   });
//   next();
// });

// // ADD THIS TEST ROUTE HERE:
// app.get('/test', (req, res) => {
//   res.json({ 
//     message: 'Server is working!',
//     env: process.env.NODE_ENV,
//     port: process.env.PORT,
//     __dirname: __dirname
//   });
// });

// (async () => {
//   const server = await registerRoutes(app);
//   app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//     const status = err.status || err.statusCode || 500;
//     const message = err.message || "Internal Server Error";
//     res.status(status).json({ message });
//     throw err;
//   });
//   // importantly only setup vite in development and after
//   // setting up all the other routes so the catch-all route
//   // doesn't interfere with the other routes
//   if (app.get("env") === "development") {
//     await setupVite(app, server);
//   } else {
//     serveStatic(app);
//   }
//   // ALWAYS serve the app on port 5000
//   // this serves both the API and the client.
//   // It is the only port that is not firewalled.
//   const port = process.env.PORT || 5000;
//   server.listen({
//     port,
//     host: "0.0.0.0",
//     reusePort: true,
//   }, () => {
//     log(`serving on port ${port}`);
//   });
// })();


import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

console.log("=== SERVER STARTUP BEGINNING ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("JWT_SECRET present:", !!process.env.JWT_SECRET);

const app = express();

console.log("Express app created");

// Increase JSON payload size limit for image uploads (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

console.log("Middleware configured");

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

console.log("Request logging middleware configured");

// Add basic health check
app.get('/health', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    timestamp: new Date().toISOString()
  });
});

console.log("Health check route added");

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

(async () => {
  try {
    console.log("=== STARTING ASYNC SETUP ===");
    
    console.log("About to call registerRoutes...");
    const server = await registerRoutes(app);
    console.log("✓ Routes registered successfully");
    
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Error middleware triggered:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      // Don't throw the error, just log it
      console.error("Error details:", err.stack);
    });
    
    console.log("Error middleware configured");
    
    // Debug environment
    console.log("Environment check - NODE_ENV:", process.env.NODE_ENV);
    
    if (process.env.NODE_ENV === "development") {
      console.log("Setting up Vite for development...");
      await setupVite(app, server);
    } else {
      console.log("Setting up static file serving for production...");
      try {
        serveStatic(app);
        console.log("✓ Static file serving configured");
      } catch (staticError) {
        console.error("❌ Static file serving failed:", staticError);
        throw staticError;
      }
    }
    
    const port = process.env.PORT || 8080;
    console.log("About to listen on port:", port);
    
    server.listen({
      port: Number(port),
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      console.log("✓ Server listening successfully");
      log(`serving on port ${port}`);
    });
    
  } catch (error) {
    console.error("❌ FATAL ERROR during server startup:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
})();

console.log("=== ASYNC SETUP INITIATED ===");
