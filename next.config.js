const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
    };

    // Copy PDF.js worker to static files (client-side only)
    if (!isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(
                __dirname,
                'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'
              ),
              to: path.join(__dirname, 'public/pdf.worker.min.mjs'),
            },
          ],
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;
