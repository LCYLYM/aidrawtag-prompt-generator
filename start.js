const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// 设置环境变量，禁用TypeScript错误和自动安装
process.env.NEXT_IGNORE_TS_ERRORS = "true";
process.env.SKIP_INSTALL = "1";

// 检查data目录是否存在（但不强制退出）
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  console.warn("警告: data目录不存在，应用可能无法正常工作");
  console.warn("如需处理Excel数据，请先运行: npm run process");
} else {
  console.log("数据目录检查完毕");
}

// 简单地启动Next.js应用
console.log("正在启动AI绘图提示词助手...");

// 使用cross-spawn确保跨平台兼容性
const nextProcess = spawn("npm", ["run", "dev"], {
  cwd: __dirname,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

// 输出友好的URL信息
setTimeout(() => {
  console.log("\n---------------------------------------");
  console.log("应用正在启动中，请稍候...");
  console.log("启动完成后，请访问: http://localhost:3000");
  console.log("(如果端口3000被占用，可能会使用其他端口，请查看控制台输出)");
  console.log("---------------------------------------\n");
}, 1000);

nextProcess.on("close", (code) => {
  console.log(`Next.js应用已关闭，退出码 ${code}`);
});
