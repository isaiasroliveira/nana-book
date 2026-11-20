import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: { agentUpgrade: "security" },
};

export default config;
