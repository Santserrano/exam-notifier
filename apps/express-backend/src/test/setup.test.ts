import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

import { prisma,testUtils } from "./setup";

// Mock de execSync
jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

// Mock de PrismaClient
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      createMany: jest.fn(),
    },
  })),
}));

describe("Setup Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("resetTestDatabase", () => {
    it("should call prisma migrate reset when in test environment", () => {
      process.env.NODE_ENV = "test";
      testUtils.resetTestDatabase();
      expect(execSync).toHaveBeenCalledWith(
        "npx prisma migrate reset --force --skip-seed",
        { stdio: "inherit" }
      );
    });

    it("should not call prisma migrate reset when not in test environment", () => {
      process.env.NODE_ENV = "development";
      testUtils.resetTestDatabase();
      expect(execSync).not.toHaveBeenCalled();
    });

    it("should handle errors during database reset", () => {
      process.env.NODE_ENV = "test";
      (execSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Reset failed");
      });
      expect(() => testUtils.resetTestDatabase()).toThrow("Reset failed");
    });
  });

  describe("seedTestData", () => {
    it("should create multiple records for each model", async () => {
      const testData = {
        user: [
          { name: "Test User 1" },
          { name: "Test User 2" },
        ],
      };

      await testUtils.seedTestData(testData);
      expect(prisma.user.createMany).toHaveBeenCalledWith({
        data: testData.user,
      });
    });
  });

  describe("Prisma Client", () => {
    it("should connect and disconnect properly", async () => {
      const mockPrisma = new PrismaClient();
      await mockPrisma.$connect();
      expect(mockPrisma.$connect).toHaveBeenCalled();

      await mockPrisma.$disconnect();
      expect(mockPrisma.$disconnect).toHaveBeenCalled();
    });
  });
});
