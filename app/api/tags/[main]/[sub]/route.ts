import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Mock implementation of the Flask API endpoint for tags
export async function GET(
  request: Request,
  { params }: { params: { main: string; sub: string } }
) {
  // 使用params应该等待它解析完成，这里正确解构params对象
  const mainCategory = decodeURIComponent(params.main);
  const subCategory = decodeURIComponent(params.sub);

  try {
    // 读取处理后的标签数据
    const dataDirectory = path.join(process.cwd(), "data");
    const fileContents = await fs.readFile(
      path.join(dataDirectory, "processed_tags_data.json"),
      "utf8"
    );
    const tagsData = JSON.parse(fileContents);

    // 获取指定主分类和子分类的标签
    if (tagsData[mainCategory] && tagsData[mainCategory][subCategory]) {
      return NextResponse.json(tagsData[mainCategory][subCategory]);
    }

    // 如果找不到对应分类的标签，返回空数组
    return NextResponse.json([]);
  } catch (error) {
    console.error("Error reading tag data:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
