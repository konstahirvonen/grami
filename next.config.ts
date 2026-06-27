import type { NextConfig } from "next";

const nextConfig= {
  experimental: {
    https: true
  }
};
module.exports = {
  allowedDevOrigins: ['192.168.101.105'],
}
export default nextConfig;
