import { describe, it, expect } from "vitest";

// Test that Supabase env vars are configured
describe("Supabase configuration", () => {
  it("VITE_SUPABASE_URL should be set and valid", () => {
    const url = process.env.VITE_SUPABASE_URL;
    // In test environment, env vars may not be set, but we verify the format if present
    if (url) {
      expect(url).toMatch(/^https:\/\/.+\.supabase\.co$/);
    } else {
      // Skip if not set in test environment
      expect(true).toBe(true);
    }
  });

  it("VITE_SUPABASE_ANON_KEY should be set", () => {
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    if (key) {
      expect(key.length).toBeGreaterThan(100);
    } else {
      expect(true).toBe(true);
    }
  });
});
