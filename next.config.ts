import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  reactCompiler: false,
  compress: true,
  productionBrowserSourceMaps: false,

  turbopack: {}, // just for mute warnings

  async headers() {
    return [
      {
        source: "/hdri/:path*.hdr",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "Content-Type", value: "image/vnd.radiance" },
        ],
      },
      {
        source: "/models/:path*.glb",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "Content-Type", value: "model/gltf-binary" },
        ],
      },
      {
        source: "/textures/:path*.ktx2",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "Content-Type", value: "image/ktx2" },
        ],
      },
      {
        source: "/fonts/:path*.woff2",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
