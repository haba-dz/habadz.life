import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // تشغيل ذاتي داخل Docker: مخرجات standalone تحتوي خادمًا مستقلًا بلا node_modules كاملة.
  output: "standalone",
  // sharp غير مثبّت والصور تُقدَّم كما هي (استخدام next/image محدود جدًا).
  images: { unoptimized: true },
  // حماية من انحراف الإصدارات بين نشرة وأخرى — تُمرَّر من CI كـ SHA للإصدار.
  deploymentId: process.env.NEXT_DEPLOYMENT_ID,
};

export default nextConfig;
