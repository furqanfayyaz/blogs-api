import { Request, Response, NextFunction } from "express";
import { CreateBlogDto, ReplaceBlogDto, UpdateBlogDto } from "../types/blog.types";

// Validate POST body
export const validateCreate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body = req.body as CreateBlogDto;
  const required = ["title", "content", "author", "slug"];

  for (const field of required) {
    if (!body[field as keyof CreateBlogDto]) {
      res.status(422).json({
        success: false,
        message: "Validation failed",
        error: `\`${field}\` is required.`,
      });
      return;
    }
  }

  next();
};

// Validate PUT body — all fields required
export const validateReplace = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body = req.body as ReplaceBlogDto;
  const required = ["title", "content", "author", "slug", "tags", "published"];

  for (const field of required) {
    if (body[field as keyof ReplaceBlogDto] === undefined) {
      res.status(422).json({
        success: false,
        message: "Validation failed",
        error: `PUT requires all fields. Missing: \`${field}\`. Use PATCH for partial updates.`,
      });
      return;
    }
  }

  next();
};

// Validate PATCH body — at least one field required
export const validateUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body = req.body as UpdateBlogDto;

  if (!body || Object.keys(body).length === 0) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      error: "PATCH body cannot be empty. Provide at least one field to update.",
    });
    return;
  }

  next();
};
