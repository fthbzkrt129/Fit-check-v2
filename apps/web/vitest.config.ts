import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  esbuild: {
    jsx: "automatic"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  test: {
    environment: "node",
    passWithNoTests: true,
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: ["src/components/**"],
          environment: "jsdom",
          setupFiles: ["src/test-setup.ts"]
        }
      },
      {
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "./src")
          }
        },
        test: {
          name: "kombin",
          include: ["src/components/**/*.test.tsx"],
          environment: "jsdom",
          setupFiles: ["src/test-setup.ts"]
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
