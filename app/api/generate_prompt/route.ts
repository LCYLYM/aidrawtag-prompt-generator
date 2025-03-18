import { NextResponse } from "next/server";

// 定义支持的提示词格式
type PromptFormat = "standard" | "comfy" | "midjourney" | "sd" | "dalle";

interface Tag {
  tag_en: string;
  tag_cn: string;
  weight?: number;
  main_category?: string;
  sub_category?: string;
}

interface GenerateRequest {
  tags: Tag[];
  format?: PromptFormat;
  negativePrompt?: string;
  style?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequest;
    const { tags, format = "standard", negativePrompt = "", style = "" } = body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid request: tags array is required",
        },
        { status: 400 }
      );
    }

    // 根据不同格式生成提示词
    let prompt_en = "";
    let prompt_cn = "";

    // 先按照权重对标签排序
    const sortedTags = [...tags].sort((a, b) => {
      const weightA = a.weight !== undefined ? a.weight : 1.0;
      const weightB = b.weight !== undefined ? b.weight : 1.0;
      return weightB - weightA;
    });

    // 处理不同的提示词格式
    switch (format) {
      case "comfy":
        // ComfyUI格式: (tag:weight), (tag:weight)
        prompt_en = sortedTags
          .map((tag) => {
            const weight = tag.weight !== undefined ? tag.weight : 1.0;
            return weight === 1.0
              ? tag.tag_en
              : `(${tag.tag_en}:${weight.toFixed(1)})`;
          })
          .join(", ");

        prompt_cn = sortedTags
          .map((tag) => {
            const weight = tag.weight !== undefined ? tag.weight : 1.0;
            return weight === 1.0
              ? tag.tag_cn
              : `(${tag.tag_cn}:${weight.toFixed(1)})`;
          })
          .join(", ");
        break;

      case "midjourney":
        // Midjourney格式: tag1, tag2 --style raw
        prompt_en = sortedTags.map((tag) => tag.tag_en).join(", ");
        if (style) {
          prompt_en += ` --style ${style}`;
        }

        prompt_cn = sortedTags.map((tag) => tag.tag_cn).join(", ");
        if (style) {
          prompt_cn += ` --style ${style}`;
        }
        break;

      case "sd":
        // Stable Diffusion格式: tag1, tag2, tag3
        prompt_en = sortedTags
          .map((tag) => {
            const weight = tag.weight !== undefined ? tag.weight : 1.0;
            return weight === 1.0
              ? tag.tag_en
              : `(${tag.tag_en}:${weight.toFixed(1)})`;
          })
          .join(", ");

        prompt_cn = sortedTags
          .map((tag) => {
            const weight = tag.weight !== undefined ? tag.weight : 1.0;
            return weight === 1.0
              ? tag.tag_cn
              : `(${tag.tag_cn}:${weight.toFixed(1)})`;
          })
          .join(", ");
        break;

      case "dalle":
        // DALL-E格式: 简单的逗号分隔，无权重
        prompt_en = sortedTags.map((tag) => tag.tag_en).join(", ");
        prompt_cn = sortedTags.map((tag) => tag.tag_cn).join(", ");
        break;

      case "standard":
      default:
        // 标准格式: tag1, tag2, tag3
        prompt_en = sortedTags
          .map((tag) => {
            const weight = tag.weight !== undefined ? tag.weight : 1.0;
            return weight === 1.0
              ? tag.tag_en
              : weight > 1.0
              ? `(${tag.tag_en})`.repeat(Math.floor(weight))
              : `${tag.tag_en}`;
          })
          .join(", ");

        prompt_cn = sortedTags
          .map((tag) => {
            const weight = tag.weight !== undefined ? tag.weight : 1.0;
            return weight === 1.0
              ? tag.tag_cn
              : weight > 1.0
              ? `(${tag.tag_cn})`.repeat(Math.floor(weight))
              : `${tag.tag_cn}`;
          })
          .join(", ");
        break;
    }

    // 添加负面提示词
    const negativePart = negativePrompt
      ? {
          negative_prompt_en: negativePrompt,
          negative_prompt_cn: negativePrompt,
        }
      : {};

    return NextResponse.json({
      prompt_en,
      prompt_cn,
      format,
      style,
      ...negativePart,
    });
  } catch (error) {
    console.error("Error generating prompt:", error);
    return NextResponse.json(
      {
        error: "Failed to generate prompt",
      },
      { status: 500 }
    );
  }
}
