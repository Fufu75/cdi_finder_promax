/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["docx", "mammoth", "unpdf", "@anthropic-ai/sdk", "openai", "@google/genai"],
};

export default nextConfig;
