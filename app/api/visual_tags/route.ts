import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    // 获取查询参数中的类别
    const url = new URL(request.url);
    const category = url.searchParams.get("category") || "";

    if (!category) {
      return NextResponse.json(
        { error: "Category parameter is required" },
        { status: 400 }
      );
    }

    // 读取处理后的标签数据
    const dataDirectory = path.join(process.cwd(), "data");
    const fileContents = await fs.readFile(
      path.join(dataDirectory, "processed_tags_data.json"),
      "utf8"
    );
    const tagsData = JSON.parse(fileContents);

    // 如果类别存在，返回该类别下的所有标签的集合
    if (tagsData[category]) {
      // 将该类别下所有子类别的标签合并到一个数组中
      const allCategoryTags = Object.values(tagsData[category]).flat();

      // 随机选择最多8个标签返回
      const shuffled = (allCategoryTags as any[]).sort(
        () => 0.5 - Math.random()
      );
      const selectedTags = shuffled.slice(0, 8);

      return NextResponse.json(selectedTags);
    }

    // 如果找不到对应类别，返回空数组
    return NextResponse.json([]);
  } catch (error) {
    console.error("Error reading visual tags data:", error);
    return NextResponse.json(
      { error: "Failed to fetch visual tags" },
      { status: 500 }
    );
  }
}
