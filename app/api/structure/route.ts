import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// This is a mock implementation of the Flask API endpoint
// In a real implementation, you would connect to your Flask backend
export async function GET() {
  try {
    // 读取生成的结构数据JSON文件
    const dataDirectory = path.join(process.cwd(), "data");
    const fileContents = await fs.readFile(
      path.join(dataDirectory, "structure_data.json"),
      "utf8"
    );
    const structure = JSON.parse(fileContents);

    return NextResponse.json(structure);
  } catch (error) {
    console.error("Error reading structure data:", error);

    // 如果文件读取失败，返回默认结构
    const defaultStructure = {
      质量: ["高质量", "低质量"],
      艺术风格: ["卡通", "现实主义", "科幻", "赛博朋克"],
      场景: ["自然", "城市", "室内"],
      人物部位: ["头部", "全身", "手部"],
      服饰: ["休闲", "正式", "特殊"],
      人物动作: ["站立", "坐姿", "动态"],
      其他: ["效果", "情绪", "背景"],
    };

    return NextResponse.json(defaultStructure);
  }
}
