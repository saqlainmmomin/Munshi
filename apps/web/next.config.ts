import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Listing photos come from Supabase Storage / source hosts; allowlist per-host
  // as real sources are wired up (PRD §8). Left empty in the skeleton.
  images: { remotePatterns: [] },
};

export default nextConfig;
