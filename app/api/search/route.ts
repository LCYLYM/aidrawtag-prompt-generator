import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Mock implementation of the Flask API endpoint for search
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    // 读取生成的搜索数据JSON文件
    const dataDirectory = path.join(process.cwd(), "data");
    const fileContents = await fs.readFile(
      path.join(dataDirectory, "search_tags_data.json"),
      "utf8"
    );
    const allTags = JSON.parse(fileContents);

    // 过滤标签
    const results = allTags.filter(
      (tag: any) =>
        (tag.tag_en && tag.tag_en.toLowerCase().includes(query)) ||
        (tag.tag_cn && tag.tag_cn.toLowerCase().includes(query))
    );

    // 按权重排序
    results.sort((a: any, b: any) => (b.weight || 1.0) - (a.weight || 1.0));

    // 限制返回结果的数量以避免响应过大
    return NextResponse.json(results.slice(0, 20));
  } catch (error) {
    console.error("Error reading search data:", error);
    return NextResponse.json([]);
  }
}
