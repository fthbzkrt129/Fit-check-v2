import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    passWithNoTests: true,
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"]
        }
      },
      {
        test: {
          name: "db",
          include: ["src/**/*.db.test.ts"]
        }
      }
    ]
  }
});
