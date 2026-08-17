import { Request, Response } from "express";
import mongoose from "mongoose";
import Blog from "../models/blog.model";
import { CreateBlogDto, ReplaceBlogDto, UpdateBlogDto } from "../types/blog.types";

// Helper — check if an id is a valid MongoDB ObjectId
const isValidId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

// ─────────────────────────────────────────────
// GET /api/blogs
// Returns all blogs with optional filters
// Status: 200 OK
// ─────────────────────────────────────────────
export const getAllBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { published, author, tag } = req.query;
    const filter: Record<string, unknown> = {};

    if (published !== undefined) filter.published = published === "true";
    if (author) filter.author = { $regex: author, $options: "i" };
    if (tag) filter.tags = { $in: [tag] };

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });

    // 200 OK — successful retrieval
    res.status(200).json({
      success: true,
      message: "Blogs retrieved successfully.",
      data: blogs,
      meta: {
        total: blogs.length,
        filters: { published, author, tag },
      },
    });
  } catch (error) {
    // 500 Internal Server Error — unexpected DB/server error
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: (error as Error).message,
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/blogs/:id
// Returns a single blog by MongoDB _id
// Status: 200 OK | 400 Bad Request | 404 Not Found
// ─────────────────────────────────────────────
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 400 Bad Request — invalid MongoDB ObjectId format
    if (!isValidId(id)) {
      res.status(400).json({
        success: false,
        message: "Bad Request.",
        error: `'${id}' is not a valid blog ID.`,
      });
      return;
    }

    const blog = await Blog.findById(id);

    // 404 Not Found — blog does not exist
    if (!blog) {
      res.status(404).json({
        success: false,
        message: "Blog not found.",
        error: `No blog with id '${id}' exists.`,
      });
      return;
    }

    // 200 OK
    res.status(200).json({
      success: true,
      message: "Blog retrieved successfully.",
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: (error as Error).message,
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/blogs
// Creates a new blog
// Status: 201 Created | 409 Conflict | 422 Unprocessable Entity
// ─────────────────────────────────────────────
export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as CreateBlogDto;
    const blog = await Blog.create(body);

    // 201 Created — new resource created
    // Location header tells client where to find the new resource
    res
      .status(201)
      .location(`/api/blogs/${blog._id}`)
      .json({
        success: true,
        message: "Blog created successfully.",
        data: blog,
      });
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string; name?: string };

    // 409 Conflict — duplicate slug (unique index violation)
    if (err.code === 11000) {
      res.status(409).json({
        success: false,
        message: "Conflict — duplicate resource.",
        error: "A blog with this slug already exists. Please use a different slug.",
      });
      return;
    }

    // 422 Unprocessable Entity — Mongoose validation error
    if (err.name === "ValidationError") {
      res.status(422).json({
        success: false,
        message: "Validation failed.",
        error: err.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: err.message,
    });
  }
};

// ─────────────────────────────────────────────
// PUT /api/blogs/:id
// Fully replaces a blog (all fields required)
// Status: 200 OK | 400 | 404 | 409 | 422
// ─────────────────────────────────────────────
export const replaceBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400).json({ success: false, message: "Bad Request.", error: `'${id}' is not a valid blog ID.` });
      return;
    }

    const body = req.body as ReplaceBlogDto;

    // findOneAndReplace does a true full replacement (not a merge)
    const blog = await Blog.findOneAndReplace(
      { _id: id },
      body,
      { new: true, runValidators: true }
    );

    if (!blog) {
      res.status(404).json({ success: false, message: "Blog not found.", error: `No blog with id '${id}' exists.` });
      return;
    }

    // 200 OK — resource fully replaced
    res.status(200).json({
      success: true,
      message: "Blog replaced successfully (full update).",
      data: blog,
    });
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string; name?: string };
    if (err.code === 11000) {
      res.status(409).json({ success: false, message: "Conflict.", error: "Slug already exists." });
      return;
    }
    if (err.name === "ValidationError") {
      res.status(422).json({ success: false, message: "Validation failed.", error: err.message });
      return;
    }
    res.status(500).json({ success: false, message: "Internal Server Error.", error: err.message });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/blogs/:id
// Partially updates a blog (any fields)
// Status: 200 OK | 400 | 404 | 409 | 422
// ─────────────────────────────────────────────
export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400).json({ success: false, message: "Bad Request.", error: `'${id}' is not a valid blog ID.` });
      return;
    }

    const body = req.body as UpdateBlogDto;

    // $set ensures only provided fields are updated (true partial update)
    const blog = await Blog.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!blog) {
      res.status(404).json({ success: false, message: "Blog not found.", error: `No blog with id '${id}' exists.` });
      return;
    }

    // 200 OK — resource partially updated
    res.status(200).json({
      success: true,
      message: "Blog updated successfully (partial update).",
      data: blog,
    });
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string; name?: string };
    if (err.code === 11000) {
      res.status(409).json({ success: false, message: "Conflict.", error: "Slug already exists." });
      return;
    }
    if (err.name === "ValidationError") {
      res.status(422).json({ success: false, message: "Validation failed.", error: err.message });
      return;
    }
    res.status(500).json({ success: false, message: "Internal Server Error.", error: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/blogs/:id
// Deletes a single blog
// Status: 200 OK | 400 Bad Request | 404 Not Found
// ─────────────────────────────────────────────
export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400).json({ success: false, message: "Bad Request.", error: `'${id}' is not a valid blog ID.` });
      return;
    }

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      res.status(404).json({ success: false, message: "Blog not found.", error: `No blog with id '${id}' exists.` });
      return;
    }

    // 200 OK — deleted resource returned in response
    res.status(200).json({
      success: true,
      message: "Blog deleted successfully.",
      data: blog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error.", error: (error as Error).message });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/blogs
// Deletes ALL blogs
// Status: 200 OK
// ─────────────────────────────────────────────
export const deleteAllBlogs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await Blog.deleteMany({});

    res.status(200).json({
      success: true,
      message: "All blogs deleted successfully.",
      meta: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error.", error: (error as Error).message });
  }
};
