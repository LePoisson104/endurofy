import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [`${process.env.NEXT_PUBLIC_API_URL}`],
};

export default nextConfig;
