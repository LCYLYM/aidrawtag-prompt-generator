let userConfig = undefined;
try {
  userConfig = await import("./v0-user-next.config");
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 设置输出模式为导出静态HTML
  // output: 'export',

  // 禁用严格模式，如果遇到问题可以尝试取消注释
  // reactStrictMode: false,

  // 配置TypeScript，这里我们设置为忽略类型检查以减少初始设置障碍
  typescript: {
    // !! 仅在开发过程中建议使用这个选项
    // 在生产环境应该进行完整类型检查
    ignoreBuildErrors: true,
  },

  // 允许未使用的变量，解决初始设置中的一些警告
  eslint: {
    // 同样，仅开发过程中建议使用此选项
    ignoreDuringBuilds: true,
  },

  // 允许导入图片等资源
  images: {
    unoptimized: true,
  },

  // 国际化配置已移至App Router中实现
  // 不再使用旧式i18n配置，避免警告

  // 实验性功能配置
  experimental: {
    // 这些是一些实验性功能，可根据需要启用
    // esmExternals: 'loose',
    // serverComponentsExternalPackages: [],
  },
};

mergeConfig(nextConfig, userConfig);

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return;
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === "object" &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      };
    } else {
      nextConfig[key] = userConfig[key];
    }
  }
}

export default nextConfig;
