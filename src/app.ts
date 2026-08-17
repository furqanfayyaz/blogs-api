import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import blogRoutes from "./routes/blog.routes";

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Root Route ───────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  // 200 OK
  res.status(200).json({
    success: true,
    message: "Blogs API is running.",
    version: "1.0.0",
    endpoints: {
      "GET    /api/blogs":       "Get all blogs (supports ?published, ?author, ?tag filters)",
      "GET    /api/blogs/:id":   "Get a single blog",
      "POST   /api/blogs":       "Create a new blog",
      "PUT    /api/blogs/:id":   "Fully replace a blog (all fields required)",
      "PATCH  /api/blogs/:id":   "Partially update a blog (any fields)",
      "DELETE /api/blogs/:id":   "Delete a single blog",
      "DELETE /api/blogs":       "Delete all blogs",
    },
  });
});

// ─── Blog Routes ──────────────────────────────
app.use("/api/blogs", blogRoutes);

// ─── Global 404 Handler ───────────────────────
app.use((_req: Request, res: Response) => {
  // 404 Not Found — no route matched
  res.status(404).json({
    success: false,
    message: "Route not found.",
    error: "The endpoint you are trying to reach does not exist.",
  });
});

// ─── Global Error Handler ─────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[ERROR]", err.message);
  // 500 Internal Server Error
  res.status(500).json({
    success: false,
    message: "Internal Server Error.",
    error: err.message,
  });
});

// ─── Start Server ─────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 API root:   http://localhost:${PORT}/`);
  console.log(`📝 Blogs:      http://localhost:${PORT}/api/blogs\n`);
});

export default app;
