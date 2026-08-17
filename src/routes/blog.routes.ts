import { Router } from "express";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  replaceBlog,
  updateBlog,
  deleteBlog,
  deleteAllBlogs,
} from "../controllers/blog.controller";
import {
  validateCreate,
  validateReplace,
  validateUpdate,
} from "../middleware/validation.middleware";

const router = Router();

// Collection routes
router.get("/", getAllBlogs);                          // GET    all blogs
router.post("/", validateCreate, createBlog);         // POST   create blog
router.delete("/", deleteAllBlogs);                   // DELETE all blogs

// Single resource routes
router.get("/:id", getBlogById);                      // GET    one blog
router.put("/:id", validateReplace, replaceBlog);     // PUT    full replace
router.patch("/:id", validateUpdate, updateBlog);     // PATCH  partial update
router.delete("/:id", deleteBlog);                    // DELETE one blog

export default router;
