import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    // 读取预定义组合数据
    const dataDirectory = path.join(process.cwd(), "data");
    const fileContents = await fs.readFile(
      path.join(dataDirectory, "predefined_combinations.json"),
      "utf8"
    );
    const combinations = JSON.parse(fileContents);

    return NextResponse.json(combinations);
  } catch (error) {
    console.error("Error reading predefined combinations:", error);

    // 如果文件读取失败，返回默认组合
    const defaultCombinations = [
      {
        name: "动漫风格少女",
        tags: [
          {
            main_category: "人物部位",
            sub_category: "头部",
            tag_en: "anime face",
            tag_cn: "动漫脸",
          },
          {
            main_category: "人物部位",
            sub_category: "全身",
            tag_en: "beautiful girl",
            tag_cn: "美少女",
          },
          {
            main_category: "艺术风格",
            sub_category: "卡通",
            tag_en: "anime style",
            tag_cn: "动漫风格",
          },
          {
            main_category: "质量",
            sub_category: "高质量",
            tag_en: "masterpiece",
            tag_cn: "杰作",
          },
        ],
      },
      {
        name: "自然风景",
        tags: [
          {
            main_category: "场景",
            sub_category: "自然",
            tag_en: "beautiful landscape",
            tag_cn: "美丽风景",
          },
          {
            main_category: "场景",
            sub_category: "自然",
            tag_en: "mountains",
            tag_cn: "山脉",
          },
          {
            main_category: "场景",
            sub_category: "自然",
            tag_en: "lake",
            tag_cn: "湖泊",
          },
          {
            main_category: "质量",
            sub_category: "高质量",
            tag_en: "high quality",
            tag_cn: "高质量",
          },
        ],
      },
      {
        name: "科幻城市",
        tags: [
          {
            main_category: "场景",
            sub_category: "城市",
            tag_en: "futuristic city",
            tag_cn: "未来城市",
          },
          {
            main_category: "艺术风格",
            sub_category: "科幻",
            tag_en: "sci-fi",
            tag_cn: "科幻",
          },
          {
            main_category: "艺术风格",
            sub_category: "赛博朋克",
            tag_en: "cyberpunk",
            tag_cn: "赛博朋克",
          },
          {
            main_category: "质量",
            sub_category: "高质量",
            tag_en: "detailed",
            tag_cn: "细节",
          },
        ],
      },
      {
        name: "写实人像",
        tags: [
          {
            main_category: "人物部位",
            sub_category: "头部",
            tag_en: "realistic face",
            tag_cn: "写实脸部",
          },
          {
            main_category: "人物部位",
            sub_category: "全身",
            tag_en: "human",
            tag_cn: "人类",
          },
          {
            main_category: "艺术风格",
            sub_category: "现实主义",
            tag_en: "photorealistic",
            tag_cn: "照片级写实",
          },
          {
            main_category: "质量",
            sub_category: "高质量",
            tag_en: "high detail",
            tag_cn: "高细节",
          },
        ],
      },
    ];

    return NextResponse.json(defaultCombinations);
  }
}
