import { NextFunction, Request, Response } from "express";

export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const API_KEY = process.env.INTERNAL_API_KEY;
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== API_KEY) {
    res.status(401).json({
      error: "Error: Invalid",
    });
    return;
  }

  next();
};
