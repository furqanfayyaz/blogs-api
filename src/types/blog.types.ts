export interface CreateBlogDto {
  title: string;
  content: string;
  author: string;
  slug: string;
  tags?: string[];
  published?: boolean;
}

export interface ReplaceBlogDto {
  title: string;
  content: string;
  author: string;
  slug: string;
  tags: string[];
  published: boolean;
}

export interface UpdateBlogDto {
  title?: string;
  content?: string;
  author?: string;
  slug?: string;
  tags?: string[];
  published?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
}
