import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactCompiler: true,
// };

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
