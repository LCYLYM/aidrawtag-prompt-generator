const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// 确保data目录存在
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("已创建data目录");
}

// 运行Python数据处理脚本
console.log("正在处理Excel数据...");
const pythonProcess = spawn("python", ["data-processor.py"], {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: true,
});

pythonProcess.on("close", (code) => {
  if (code !== 0) {
    console.error(`数据处理脚本退出，退出码 ${code}`);
    return;
  }

  console.log("数据处理完成");

  // 确保处理后的数据文件在正确的位置
  const sourceDir = process.cwd();
  const files = [
    "processed_tags_data.json",
    "search_tags_data.json",
    "structure_data.json",
    "predefined_combinations.json",
  ];

  let copyCount = 0;
  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(dataDir, file);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`已复制 ${file} 到 data 目录`);
      copyCount++;
    } else {
      console.warn(`警告: ${file} 不存在于源目录`);
    }
  });

  if (copyCount === files.length) {
    console.log("\n数据处理和复制全部完成!");
    console.log("现在可以运行 `node start.js` 启动应用了");
  } else {
    console.error("\n部分文件处理失败，请检查错误信息");
  }
});
