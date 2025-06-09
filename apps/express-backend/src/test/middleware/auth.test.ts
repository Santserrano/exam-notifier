import { NextFunction, Request, Response } from "express";

import { validateApiKey } from "../../middleware/auth";
import { getServerEnv } from "../../utils/env";

jest.mock("../../utils/env", () => ({
  getServerEnv: jest.fn(),
}));

describe("validateApiKey middleware", () => {
  let req: Partial<Request>,
    res: Partial<Response>,
    next: jest.Mock<NextFunction>;

  beforeEach(() => {
    req = {
      headers: {}, // Esto es correcto para Express (no usa el tipo Headers nativo)
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("validateApiKey middleware", () => {
    let req: Partial<Request>, res: any, next: jest.Mock;

    beforeEach(() => {
      req = { headers: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
      jest.clearAllMocks();
    });

    it("debería rechazar si falta la api key", () => {
      (getServerEnv as jest.Mock).mockReturnValue({
        INTERNAL_API_KEY: "secret",
      });

      validateApiKey(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "API key inválida" });
      expect(next).not.toHaveBeenCalled();
    });

    it("debería rechazar si la api key es incorrecta", () => {
      (getServerEnv as jest.Mock).mockReturnValue({
        INTERNAL_API_KEY: "secret",
      });
      req.headers = { "x-api-key": "wrong" };

      validateApiKey(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "API key inválida" });
      expect(next).not.toHaveBeenCalled();
    });

    it("debería aceptar si la api key es correcta", () => {
      (getServerEnv as jest.Mock).mockReturnValue({
        INTERNAL_API_KEY: "secret",
      });
      req.headers = { "x-api-key": "secret" };

      validateApiKey(req as Request, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // ... tus tests ...
});
