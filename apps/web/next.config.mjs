/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cookbook/food-lang"],
  serverExternalPackages: ["puppeteer"],
};

export default nextConfig;
