"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  X,
  Copy,
  Save,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// 在文件顶部导入看板娘组件
import { KanbanMusume } from "@/components/kanban-musume";

// Types
interface Tag {
  tag_en: string;
  tag_cn: string;
  weight?: number;
  main_category?: string;
  sub_category?: string;
}

interface CategoryStructure {
  [mainCategory: string]: string[];
}

interface TagsData {
  [mainCategory: string]: {
    [subCategory: string]: Tag[];
  };
}

interface PredefinedCombination {
  name: string;
  tags: Tag[];
}

interface UserCombination {
  id: string;
  name: string;
  tags: Tag[];
}

export default function Home() {
  const { toast } = useToast();
  const [structure, setStructure] = useState<CategoryStructure>({});
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Tag[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState({ en: "", cn: "" });
  const [predefinedCombinations, setPredefinedCombinations] = useState<
    PredefinedCombination[]
  >([]);
  const [userCombinations, setUserCombinations] = useState<UserCombination[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(
    null
  );
  const [categoryTags, setCategoryTags] = useState<Tag[]>([]);
  const [visualCategory, setVisualCategory] = useState("人物部位");
  const [visualSubcategory, setVisualSubcategory] = useState<string | null>(
    null
  );
  const [recommendedTags, setRecommendedTags] = useState<Tag[]>([]);
  const [showCombinationDialog, setShowCombinationDialog] = useState(false);
  const [combinationName, setCombinationName] = useState("");
  const [selectedVisualTags, setSelectedVisualTags] = useState<Tag[]>([]);
  const [tagWeights, setTagWeights] = useState<Record<string, number>>({});
  const [promptHistory, setPromptHistory] = useState<
    { en: string; cn: string; tags: Tag[] }[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTag, setDraggedTag] = useState<Tag | null>(null);
  const [showTagDetails, setShowTagDetails] = useState<string | null>(null);
  const [recentlyUsedTags, setRecentlyUsedTags] = useState<Tag[]>([]);
  const [showMascot, setShowMascot] = useState(true);
  const [mascotMessage, setMascotMessage] =
    useState("欢迎使用AI绘图提示词辅助工具！");
  const [mascotAnimation, setMascotAnimation] = useState("idle");
  const [promptFormat, setPromptFormat] = useState<string>("standard");
  const [styleOption, setStyleOption] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [showNegativePrompt, setShowNegativePrompt] = useState(false);

  // Add a floating action button for quick actions
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Fetch category structure
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/structure");
        const data = await response.json();
        setStructure(data);

        // Set initial active category
        if (Object.keys(data).length > 0) {
          const firstCategory = Object.keys(data)[0];
          setActiveCategory(firstCategory);

          if (data[firstCategory].length > 0) {
            setActiveSubCategory(data[firstCategory][0]);
          }
        }

        // Fetch predefined combinations
        const combosResponse = await fetch("/api/predefined_combinations");
        const combosData = await response.json();
        setPredefinedCombinations(combosData);

        // Load user combinations from localStorage
        const savedCombinations = localStorage.getItem("userCombinations");
        if (savedCombinations) {
          setUserCombinations(JSON.parse(savedCombinations));
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch tags when active subcategory changes
  useEffect(() => {
    if (activeCategory && activeSubCategory) {
      fetchCategoryTags(activeCategory, activeSubCategory).then((tags) => {
        setCategoryTags(tags);
      });
    }
  }, [activeCategory, activeSubCategory]);

  // Fetch recommended tags when visual category changes
  useEffect(() => {
    if (visualCategory) {
      // In a real implementation, you would fetch recommended tags based on the visual category
      const fetchVisualCategoryTags = async () => {
        try {
          const response = await fetch(
            `/api/visual_tags?category=${encodeURIComponent(visualCategory)}`
          );
          if (response.ok) {
            const data = await response.json();
            setRecommendedTags(data.slice(0, 8)); // 限制显示数量
          } else {
            // 回退到模拟数据
            const mockRecommendedTags: Tag[] = [];

            if (visualCategory === "人物部位") {
              mockRecommendedTags.push(
                {
                  tag_en: "beautiful face",
                  tag_cn: "漂亮的脸",
                  main_category: "人物部位",
                  sub_category: "头部",
                },
                {
                  tag_en: "slim body",
                  tag_cn: "苗条身材",
                  main_category: "人物部位",
                  sub_category: "全身",
                },
                {
                  tag_en: "detailed eyes",
                  tag_cn: "细节眼睛",
                  main_category: "人物部位",
                  sub_category: "头部",
                },
                {
                  tag_en: "long legs",
                  tag_cn: "修长腿",
                  main_category: "人物部位",
                  sub_category: "下身",
                },
                {
                  tag_en: "small waist",
                  tag_cn: "小蛮腰",
                  main_category: "人物部位",
                  sub_category: "上身",
                },
                {
                  tag_en: "cute nose",
                  tag_cn: "可爱鼻子",
                  main_category: "人物部位",
                  sub_category: "头部",
                }
              );
            } else if (visualCategory === "人物动作") {
              mockRecommendedTags.push(
                {
                  tag_en: "dynamic pose",
                  tag_cn: "动态姿势",
                  main_category: "人物动作",
                  sub_category: "动态",
                },
                {
                  tag_en: "running",
                  tag_cn: "跑步",
                  main_category: "人物动作",
                  sub_category: "动态",
                },
                {
                  tag_en: "sitting",
                  tag_cn: "坐姿",
                  main_category: "人物动作",
                  sub_category: "坐姿",
                },
                {
                  tag_en: "jumping",
                  tag_cn: "跳跃",
                  main_category: "人物动作",
                  sub_category: "动态",
                },
                {
                  tag_en: "dancing",
                  tag_cn: "舞蹈",
                  main_category: "人物动作",
                  sub_category: "舞蹈",
                },
                {
                  tag_en: "fighting pose",
                  tag_cn: "战斗姿势",
                  main_category: "人物动作",
                  sub_category: "动态",
                }
              );
            } else if (visualCategory === "服饰") {
              mockRecommendedTags.push(
                {
                  tag_en: "elegant dress",
                  tag_cn: "优雅连衣裙",
                  main_category: "服饰",
                  sub_category: "正式",
                },
                {
                  tag_en: "casual wear",
                  tag_cn: "休闲装",
                  main_category: "服饰",
                  sub_category: "休闲",
                },
                {
                  tag_en: "traditional costume",
                  tag_cn: "传统服装",
                  main_category: "服饰",
                  sub_category: "特殊",
                },
                {
                  tag_en: "summer clothes",
                  tag_cn: "夏季服装",
                  main_category: "服饰",
                  sub_category: "休闲",
                },
                {
                  tag_en: "sports wear",
                  tag_cn: "运动服",
                  main_category: "服饰",
                  sub_category: "运动",
                },
                {
                  tag_en: "school uniform",
                  tag_cn: "校服",
                  main_category: "服饰",
                  sub_category: "制服",
                }
              );
            } else if (visualCategory === "场景") {
              mockRecommendedTags.push(
                {
                  tag_en: "beautiful scenery",
                  tag_cn: "美丽风景",
                  main_category: "场景",
                  sub_category: "自然",
                },
                {
                  tag_en: "city street",
                  tag_cn: "城市街道",
                  main_category: "场景",
                  sub_category: "城市",
                },
                {
                  tag_en: "cozy room",
                  tag_cn: "舒适房间",
                  main_category: "场景",
                  sub_category: "室内",
                },
                {
                  tag_en: "fantasy world",
                  tag_cn: "奇幻世界",
                  main_category: "场景",
                  sub_category: "奇幻",
                },
                {
                  tag_en: "space station",
                  tag_cn: "太空站",
                  main_category: "场景",
                  sub_category: "太空",
                },
                {
                  tag_en: "underwater palace",
                  tag_cn: "水下宫殿",
                  main_category: "场景",
                  sub_category: "水下",
                }
              );
            } else if (visualCategory === "光照") {
              mockRecommendedTags.push(
                {
                  tag_en: "sunlight",
                  tag_cn: "阳光",
                  main_category: "光照",
                  sub_category: "日光",
                },
                {
                  tag_en: "moonlight",
                  tag_cn: "月光",
                  main_category: "光照",
                  sub_category: "夜晚",
                },
                {
                  tag_en: "sunset glow",
                  tag_cn: "夕阳余晖",
                  main_category: "光照",
                  sub_category: "黄昏",
                },
                {
                  tag_en: "neon light",
                  tag_cn: "霓虹灯",
                  main_category: "光照",
                  sub_category: "霓虹",
                },
                {
                  tag_en: "soft lighting",
                  tag_cn: "柔和光线",
                  main_category: "光照",
                  sub_category: "柔光",
                },
                {
                  tag_en: "dramatic lighting",
                  tag_cn: "戏剧性光照",
                  main_category: "光照",
                  sub_category: "强光",
                }
              );
            }

            setRecommendedTags(mockRecommendedTags);
          }
        } catch (error) {
          console.error("Error fetching visual category tags:", error);
        }
      };

      fetchVisualCategoryTags();
    }
  }, [visualCategory]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching tags:", error);
    }
  };

  // Handle tag selection
  const addTag = (tag: Tag) => {
    // Check if tag is already selected
    if (
      !selectedTags.some(
        (t) => t.tag_en === tag.tag_en && t.tag_cn === tag.tag_cn
      )
    ) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Add tag from visual selection
  const addVisualTag = (tag: Tag) => {
    if (
      !selectedVisualTags.some(
        (t) => t.tag_en === tag.tag_en && t.tag_cn === tag.tag_cn
      )
    ) {
      setSelectedVisualTags([...selectedVisualTags, tag]);
      // Also add to main selected tags
      if (
        !selectedTags.some(
          (t) => t.tag_en === tag.tag_en && t.tag_cn === tag.tag_cn
        )
      ) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  // Remove tag from selection
  const removeTag = (tag: Tag) => {
    setSelectedTags(
      selectedTags.filter(
        (t) => !(t.tag_en === tag.tag_en && t.tag_cn === tag.tag_cn)
      )
    );
    // Also remove from visual tags if present
    setSelectedVisualTags(
      selectedVisualTags.filter(
        (t) => !(t.tag_en === tag.tag_en && t.tag_cn === tag.tag_cn)
      )
    );
  };

  // Remove tag from visual selection
  const removeVisualTag = (tag: Tag) => {
    setSelectedVisualTags(
      selectedVisualTags.filter(
        (t) => !(t.tag_en === tag.tag_en && t.tag_cn === tag.tag_cn)
      )
    );
    // Also remove from main selected tags
    setSelectedTags(
      selectedTags.filter(
        (t) => !(t.tag_en === tag.tag_en && t.tag_cn === tag.tag_cn)
      )
    );
  };

  // Generate prompt
  const adjustTagWeight = (tag: Tag, newWeight: number) => {
    const tagKey = `${tag.tag_en}-${tag.tag_cn}`;
    setTagWeights({
      ...tagWeights,
      [tagKey]: newWeight,
    });

    // Update the tag in selectedTags with the new weight
    const updatedTags = selectedTags.map((t) =>
      t.tag_en === tag.tag_en && t.tag_cn === tag.tag_cn
        ? { ...t, weight: newWeight }
        : t
    );

    setSelectedTags(updatedTags);

    toast({
      title: "权重已调整",
      description: `已将"${tag.tag_cn}"的权重调整为${newWeight}`,
    });
  };

  const generatePrompt = async () => {
    if (selectedTags.length === 0) {
      toast({
        title: "未选择标签",
        description: "请至少选择一个标签来生成提示词",
        variant: "destructive",
      });
      return;
    }

    try {
      // Apply custom weights from tagWeights if they exist
      const tagsWithCustomWeights = selectedTags.map((tag) => {
        const tagKey = `${tag.tag_en}-${tag.tag_cn}`;
        const customWeight = tagWeights[tagKey];
        return customWeight !== undefined
          ? { ...tag, weight: customWeight }
          : tag;
      });

      const response = await fetch("/api/generate_prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tags: tagsWithCustomWeights,
          format: promptFormat,
          negativePrompt: negativePrompt,
          style: styleOption,
        }),
      });

      const data = await response.json();
      const newPrompt = {
        en: data.prompt_en,
        cn: data.prompt_cn,
      };

      setGeneratedPrompt(newPrompt);

      // 显示成功提示
      toast({
        title: "提示词已生成",
        description: `已使用${promptFormat}格式生成提示词`,
      });

      // Save to history
      setPromptHistory((prev) => [
        { ...newPrompt, tags: [...selectedTags] },
        ...prev.slice(0, 9), // Keep only the 10 most recent
      ]);

      // Update recently used tags
      const newRecentTags = [...selectedTags];
      setRecentlyUsedTags((prev) => {
        const combined = [...newRecentTags, ...prev];
        // Remove duplicates and keep only the 10 most recent
        return Array.from(
          new Map(
            combined.map((tag) => [`${tag.tag_en}-${tag.tag_cn}`, tag])
          ).values()
        ).slice(0, 10);
      });
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast({
        title: "错误",
        description: "生成提示词时出错",
        variant: "destructive",
      });
    }
  };

  // Copy prompt to clipboard
  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "已复制到剪贴板",
      description: "提示词已复制到您的剪贴板",
    });
  };

  // Apply predefined combination
  const applyPredefinedCombination = (combination: PredefinedCombination) => {
    setSelectedTags(combination.tags);
    toast({
      title: "已应用组合",
      description: `已应用"${combination.name}"标签组合`,
    });
  };

  // Apply user combination
  const applyUserCombination = (combination: UserCombination) => {
    setSelectedTags(combination.tags);
    toast({
      title: "已应用组合",
      description: `已应用"${combination.name}"标签组合`,
    });
  };

  // Delete user combination
  const deleteUserCombination = (id: string) => {
    const updatedCombinations = userCombinations.filter(
      (combo) => combo.id !== id
    );
    setUserCombinations(updatedCombinations);
    localStorage.setItem(
      "userCombinations",
      JSON.stringify(updatedCombinations)
    );
    toast({
      title: "已删除组合",
      description: "您的自定义组合已被删除",
    });
  };

  // Save user combination
  const saveUserCombination = () => {
    if (!combinationName.trim()) {
      toast({
        title: "请输入组合名称",
        description: "组合名称不能为空",
        variant: "destructive",
      });
      return;
    }

    if (selectedTags.length === 0) {
      toast({
        title: "未选择标签",
        description: "请至少选择一个标签来创建组合",
        variant: "destructive",
      });
      return;
    }

    const newCombination: UserCombination = {
      id: Date.now().toString(),
      name: combinationName,
      tags: selectedTags,
    };

    const updatedCombinations = [...userCombinations, newCombination];
    setUserCombinations(updatedCombinations);
    localStorage.setItem(
      "userCombinations",
      JSON.stringify(updatedCombinations)
    );

    setCombinationName("");
    setShowCombinationDialog(false);

    toast({
      title: "组合已保存",
      description: "您的自定义组合已成功保存",
    });
  };

  // Clear all selected tags
  const clearSelectedTags = () => {
    setSelectedTags([]);
    setSelectedVisualTags([]);
    toast({
      title: "已清空标签",
      description: "所有已选标签已被清除",
    });
  };

  // Fetch tags for a specific category
  const fetchCategoryTags = async (
    mainCategory: string,
    subCategory: string
  ) => {
    try {
      const response = await fetch(
        `/api/tags/${encodeURIComponent(mainCategory)}/${encodeURIComponent(
          subCategory
        )}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching category tags:", error);
      return [];
    }
  };

  // Handle body part selection
  const handleBodyPartSelect = (part: string) => {
    setVisualSubcategory(part);
    fetchCategoryTags("人物部位", part).then((tags) => {
      const randomTags = tags.sort(() => 0.5 - Math.random()).slice(0, 6);
      setRecommendedTags(randomTags);
    });

    // 添加动画效果和提示
    setMascotAnimation("bounce");
    setMascotMessage(`已选择${part}，查看相关标签！`);
    setTimeout(() => setMascotAnimation("idle"), 1000);
  };

  // Handle action selection
  const handleActionSelect = (action: string) => {
    setVisualSubcategory(action);
    fetchCategoryTags("人物动作", action).then((tags) => {
      const randomTags = tags.sort(() => 0.5 - Math.random()).slice(0, 6);
      setRecommendedTags(randomTags);
    });

    setMascotAnimation("bounce");
    setMascotMessage(`已选择${action}动作，看看相关标签！`);
    setTimeout(() => setMascotAnimation("idle"), 1000);
  };

  // Handle clothing selection
  const handleClothingSelect = (clothing: string) => {
    setVisualSubcategory(clothing);
    fetchCategoryTags("服饰", clothing).then((tags) => {
      const randomTags = tags.sort(() => 0.5 - Math.random()).slice(0, 6);
      setRecommendedTags(randomTags);
    });

    setMascotAnimation("bounce");
    setMascotMessage(`已选择${clothing}，试试这些标签！`);
    setTimeout(() => setMascotAnimation("idle"), 1000);
  };

  // Handle scene selection
  const handleSceneSelect = (scene: string) => {
    setVisualSubcategory(scene);
    fetchCategoryTags("场景", scene).then((tags) => {
      const randomTags = tags.sort(() => 0.5 - Math.random()).slice(0, 6);
      setRecommendedTags(randomTags);
    });

    setMascotAnimation("bounce");
    setMascotMessage(`已选择${scene}场景，看看相关标签！`);
    setTimeout(() => setMascotAnimation("idle"), 1000);
  };

  // Handle lighting selection
  const handleLightingSelect = (lighting: string) => {
    setVisualSubcategory(lighting);
    fetchCategoryTags("光照", lighting).then((tags) => {
      const randomTags = tags.sort(() => 0.5 - Math.random()).slice(0, 6);
      setRecommendedTags(randomTags);
    });

    setMascotAnimation("bounce");
    setMascotMessage(`已选择${lighting}光照，试试这些效果！`);
    setTimeout(() => setMascotAnimation("idle"), 1000);
  };

  // Add drag and drop functionality for reordering tags
  const handleDragStart = (tag: Tag) => {
    setIsDragging(true);
    setDraggedTag(tag);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedTag(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedTag) return;

    const draggedIndex = selectedTags.findIndex(
      (t) => t.tag_en === draggedTag.tag_en && t.tag_cn === draggedTag.tag_cn
    );

    if (draggedIndex === index) return;

    const newTags = [...selectedTags];
    const [removed] = newTags.splice(draggedIndex, 1);
    newTags.splice(index, 0, removed);

    setSelectedTags(newTags);

    // 添加动画效果和提示
    setMascotAnimation("bounce");
    setMascotMessage("标签顺序已更新，排在前面的标签更重要哦！");
    setTimeout(() => setMascotAnimation("idle"), 1000);
  };

  // 增强拖拽功能 - 添加触摸支持
  const handleTouchStart = (e: React.TouchEvent, tag: Tag) => {
    e.preventDefault();
    setIsDragging(true);
    setDraggedTag(tag);

    // 添加拖拽开始的视觉反馈
    if (e.currentTarget) {
      e.currentTarget.classList.add("scale-105", "border-primary", "shadow-md");
    }
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    e.preventDefault();
    if (!draggedTag) return;

    // 获取触摸位置
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);

    // 查找目标元素
    const targetElement = elements.find(
      (el) => el.getAttribute("data-tag-index") !== null
    );

    if (targetElement) {
      const targetIndex = parseInt(
        targetElement.getAttribute("data-tag-index") || "-1"
      );
      if (targetIndex >= 0) {
        handleDragOver(e as unknown as React.DragEvent, targetIndex);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDraggedTag(null);

    // 移除所有拖拽相关的样式
    document.querySelectorAll(".tag-item").forEach((el) => {
      el.classList.remove(
        "scale-105",
        "border-primary",
        "shadow-md",
        "border-dashed"
      );
    });
  };

  // Add keyboard shortcuts and enhance the prompt generation section
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+G to generate prompt
      if (e.ctrlKey && e.key === "g" && selectedTags.length > 0) {
        e.preventDefault();
        generatePrompt();
      }

      // Ctrl+C to copy the English prompt
      if (e.ctrlKey && e.key === "c" && e.altKey && generatedPrompt.en) {
        e.preventDefault();
        copyPrompt(generatedPrompt.en);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTags, generatedPrompt]);

  useEffect(() => {
    // 定时更新看板娘消息
    const messageInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30%的概率显示随机消息
        const idleMessages = [
          "有什么需要帮助的吗？",
          "试试可视化选择功能吧！",
          "标签可以拖拽排序哦~",
          "记得保存你常用的组合！",
          "提示词已经生成了吗？",
        ];

        // 根据当前状态显示相关提示
        let contextMessages = [];
        if (selectedTags.length > 0 && !generatedPrompt.en) {
          contextMessages = [
            "已选择标签，可以生成提示词了！",
            "按Ctrl+G快速生成提示词！",
          ];
        } else if (generatedPrompt.en) {
          contextMessages = [
            "提示词已生成，可以复制使用了！",
            "可以调整标签权重再试试~",
          ];
        } else {
          contextMessages = [
            "从左侧选择标签开始吧！",
            "试试搜索你想要的标签！",
          ];
        }

        const allMessages = [...idleMessages, ...contextMessages];
        const randomMessage =
          allMessages[Math.floor(Math.random() * allMessages.length)];

        setMascotMessage(randomMessage);
        setMascotAnimation("wave");
        setTimeout(() => setMascotAnimation("idle"), 1000);
      }
    }, 15000); // 每15秒检查一次

    return () => clearInterval(messageInterval);
  }, [selectedTags, generatedPrompt]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-100">
              AI绘图提示词辅助工具
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              创建优化的AI图像生成提示词
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mb-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="22"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">
                  欢迎使用AI绘图提示词辅助工具
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  本工具可帮助您创建优质的AI绘图提示词，支持中英文双语生成。
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs mr-1">
                      Ctrl+G
                    </kbd>
                    生成提示词
                  </span>
                  <span className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs mr-1">
                      Ctrl+Alt+C
                    </kbd>
                    复制提示词
                  </span>
                  <span className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs mr-1">
                      点击标签
                    </kbd>
                    查看详情和调整权重
                  </span>
                  <span className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs mr-1">
                      拖拽标签
                    </kbd>
                    重新排序
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              placeholder="搜索标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search size={18} />
            </Button>
          </div>

          {searchResults.length > 0 && (
            <Card className="mt-2 max-w-md mx-auto">
              <CardContent className="p-4">
                <div className="space-y-2">
                  {searchResults.map((tag, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div>
                        <div className="font-medium">
                          {tag.tag_cn} ({tag.tag_en})
                        </div>
                        <div className="text-xs text-slate-500">
                          {tag.main_category} &gt; {tag.sub_category}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addTag(tag)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="browse">浏览标签</TabsTrigger>
            <TabsTrigger value="visual">可视化选择</TabsTrigger>
            <TabsTrigger value="combination">一键组合</TabsTrigger>
            <TabsTrigger value="history">历史记录</TabsTrigger>
          </TabsList>

          {/* 浏览标签页 */}
          <TabsContent value="browse" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 左侧分类和标签列表 */}
              <div className="lg:col-span-4">
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>主分类</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(structure).map((category) => (
                          <Button
                            key={category}
                            variant={
                              activeCategory === category
                                ? "default"
                                : "outline"
                            }
                            className="justify-start"
                            onClick={() => {
                              setActiveCategory(category);
                              if (structure[category].length > 0) {
                                setActiveSubCategory(structure[category][0]);
                              }
                            }}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {activeCategory && (
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle>子分类 - {activeCategory}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {structure[activeCategory]?.map((subCategory) => (
                          <Button
                            key={subCategory}
                            variant={
                              activeSubCategory === subCategory
                                ? "default"
                                : "outline"
                            }
                            className="justify-start"
                            onClick={() => setActiveSubCategory(subCategory)}
                          >
                            {subCategory}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeCategory && activeSubCategory && (
                  <Card>
                    <CardHeader>
                      <CardTitle>标签列表 - {activeSubCategory}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {categoryTags.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {categoryTags.map((tag, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <div>
                                <div className="font-medium">{tag.tag_cn}</div>
                                <div className="text-xs text-slate-500">
                                  {tag.tag_en}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  addTag({
                                    ...tag,
                                    main_category: activeCategory,
                                    sub_category: activeSubCategory,
                                  })
                                }
                              >
                                <Plus size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-4 text-slate-500">
                          暂无标签
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 右侧已选标签和生成的提示词 */}
              <div className="lg:col-span-8">
                <Card className="mb-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>已选标签</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Sort tags by category
                          const sorted = [...selectedTags].sort((a, b) => {
                            if (a.main_category !== b.main_category) {
                              return (a.main_category || "").localeCompare(
                                b.main_category || ""
                              );
                            }
                            return (a.sub_category || "").localeCompare(
                              b.sub_category || ""
                            );
                          });
                          setSelectedTags(sorted);
                          toast({
                            title: "已排序标签",
                            description: "标签已按类别排序",
                          });
                        }}
                        disabled={selectedTags.length < 2}
                      >
                        按类别排序
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelectedTags}
                        disabled={selectedTags.length === 0}
                      >
                        清空
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 pt-4">
                      {selectedTags.length === 0 ? (
                        <div className="w-full text-center py-8 text-slate-500">
                          <p>尚未选择标签</p>
                          <p className="text-xs mt-2">
                            从左侧分类中选择或使用上方搜索
                          </p>
                        </div>
                      ) : (
                        <>
                          {selectedTags.map((tag, index) => (
                            <Badge
                              key={`${tag.tag_en}-${index}`}
                              variant="outline"
                              className={`
                                tag-item
                                group relative flex gap-1 items-center pr-1 pl-2 py-1 select-none
                                border-2 cursor-move animate-fadeIn
                                ${
                                  draggedTag && draggedTag.tag_en === tag.tag_en
                                    ? "opacity-50 border-dashed"
                                    : ""
                                }
                                ${
                                  isDragging
                                    ? "hover:bg-slate-200 dark:hover:bg-slate-700"
                                    : ""
                                }
                                ${
                                  index === 0
                                    ? "border-amber-500 dark:border-amber-400"
                                    : "border-transparent"
                                }
                                transition-all duration-200 hover:shadow-sm
                              `}
                              draggable
                              data-tag-index={index}
                              onDragStart={(e) => handleDragStart(tag)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onTouchStart={(e) => handleTouchStart(e, tag)}
                              onTouchMove={(e) => handleTouchMove(e, index)}
                              onTouchEnd={handleTouchEnd}
                            >
                              {index === 0 && (
                                <span className="absolute -top-2 -left-1 text-[10px] px-1 rounded-sm bg-amber-500 text-white">
                                  主要
                                </span>
                              )}
                              <span className="flex items-center">
                                <span className="text-xs font-medium mr-1 text-slate-400">
                                  {index + 1}.
                                </span>
                                {tag.tag_cn}
                                <span className="hidden sm:inline text-xs opacity-70 ml-1">
                                  ({tag.tag_en})
                                </span>
                              </span>

                              <div className="flex gap-1 items-center">
                                <input
                                  type="number"
                                  value={
                                    tagWeights[`${tag.tag_en}-${tag.tag_cn}`] ||
                                    1
                                  }
                                  min="0.1"
                                  max="2"
                                  step="0.1"
                                  className="w-10 h-5 text-xs border-0 rounded-md focus:ring-1 focus:ring-primary"
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val) && val >= 0.1 && val <= 2) {
                                      setTagWeights({
                                        ...tagWeights,
                                        [`${tag.tag_en}-${tag.tag_cn}`]: val,
                                      });
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  onDragStart={(e) => e.stopPropagation()}
                                />

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 rounded-full p-0 opacity-50 hover:opacity-100 hover:bg-red-100 hover:text-red-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeTag(tag);
                                  }}
                                >
                                  <X size={12} />
                                </Button>
                              </div>

                              {isDragging && (
                                <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-md pointer-events-none"></div>
                              )}
                            </Badge>
                          ))}
                        </>
                      )}
                    </div>

                    {showTagDetails && (
                      <div className="mt-4 p-3 border rounded-md bg-slate-50 dark:bg-slate-800 animate-in fade-in slide-in-from-top-5 duration-300">
                        {(() => {
                          const tagKey = showTagDetails;
                          const tag = selectedTags.find(
                            (t) => `${t.tag_en}-${t.tag_cn}` === tagKey
                          );
                          if (!tag) return null;

                          const currentWeight =
                            tagWeights[tagKey] !== undefined
                              ? tagWeights[tagKey]
                              : tag.weight || 1.0;

                          return (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">
                                  标签详情: {tag.tag_cn}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowTagDetails(null)}
                                >
                                  <X size={16} />
                                </Button>
                              </div>

                              <div>
                                <p className="text-sm mb-1">
                                  英文: {tag.tag_en}
                                </p>
                                <p className="text-sm mb-1">
                                  中文: {tag.tag_cn}
                                </p>
                                <p className="text-sm mb-1">
                                  分类: {tag.main_category} &gt;{" "}
                                  {tag.sub_category}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  权重调整 (当前: {currentWeight.toFixed(1)})
                                </label>
                                <div className="flex gap-2">
                                  {[0.5, 0.8, 1.0, 1.2, 1.5].map((weight) => (
                                    <Button
                                      key={weight}
                                      variant={
                                        currentWeight === weight
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() =>
                                        adjustTagWeight(tag, weight)
                                      }
                                    >
                                      {weight.toFixed(1)}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>提示词生成选项</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setShowNegativePrompt(!showNegativePrompt)
                        }
                        title={
                          showNegativePrompt
                            ? "收起负面提示词"
                            : "展开负面提示词"
                        }
                      >
                        {showNegativePrompt ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="text-sm font-medium mb-1 block">
                          提示词格式
                        </label>
                        <Select
                          value={promptFormat}
                          onValueChange={setPromptFormat}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择提示词格式" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">标准格式</SelectItem>
                            <SelectItem value="comfy">ComfyUI格式</SelectItem>
                            <SelectItem value="midjourney">
                              Midjourney格式
                            </SelectItem>
                            <SelectItem value="sd">
                              Stable Diffusion格式
                            </SelectItem>
                            <SelectItem value="dalle">DALL-E格式</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {promptFormat === "midjourney" && (
                        <div className="col-span-1">
                          <label className="text-sm font-medium mb-1 block">
                            风格选项
                          </label>
                          <Select
                            value={styleOption}
                            onValueChange={setStyleOption}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="选择风格" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">无风格</SelectItem>
                              <SelectItem value="raw">Raw</SelectItem>
                              <SelectItem value="cute">Cute</SelectItem>
                              <SelectItem value="expressive">
                                Expressive
                              </SelectItem>
                              <SelectItem value="scenic">Scenic</SelectItem>
                              <SelectItem value="manga">Manga</SelectItem>
                              <SelectItem value="fantasy">Fantasy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="col-span-1 md:col-span-1">
                        <Button
                          className="w-full h-full"
                          onClick={generatePrompt}
                          disabled={selectedTags.length === 0}
                        >
                          <Save size={16} className="mr-2" />
                          生成提示词 (Ctrl+G)
                        </Button>
                      </div>
                    </div>

                    {showNegativePrompt && (
                      <div className="pt-2">
                        <label className="text-sm font-medium mb-1 block">
                          负面提示词
                        </label>
                        <Textarea
                          placeholder="输入负面提示词，生成时将会被包含（例如：nsfw, lowres, bad quality）"
                          className="resize-none"
                          value={negativePrompt}
                          onChange={(e) => setNegativePrompt(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="pt-4">
                      <label className="text-sm font-medium mb-2 block">
                        英文提示词
                      </label>
                      <div className="flex flex-col gap-2">
                        <div className="relative">
                          <Textarea
                            value={generatedPrompt.en}
                            readOnly
                            className="resize-none min-h-24 font-mono text-sm pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-6 w-6"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedPrompt.en);
                              toast({
                                title: "已复制",
                                description: "英文提示词已复制到剪贴板",
                              });
                            }}
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      </div>

                      <label className="text-sm font-medium mt-4 mb-2 block">
                        中文提示词
                      </label>
                      <div className="flex flex-col gap-2">
                        <div className="relative">
                          <Textarea
                            value={generatedPrompt.cn}
                            readOnly
                            className="resize-none min-h-24 font-mono text-sm pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-6 w-6"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedPrompt.cn);
                              toast({
                                title: "已复制",
                                description: "中文提示词已复制到剪贴板",
                              });
                            }}
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 可视化选择页 */}
          <TabsContent value="visual">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左侧可视化选择 */}
              <div className="lg:col-span-1">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>选择类别</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={visualCategory}
                      onValueChange={setVisualCategory}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择类别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="人物部位">人物部位</SelectItem>
                        <SelectItem value="人物动作">人物动作</SelectItem>
                        <SelectItem value="服饰">服饰</SelectItem>
                        <SelectItem value="场景">场景</SelectItem>
                        <SelectItem value="光照">光照</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {visualCategory === "人物部位" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>选择身体部位</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                        <img
                          src="/placeholder.svg?height=400&width=300"
                          alt="人体模型"
                          className="w-full h-full object-contain"
                        />

                        {/* 可点击区域 */}
                        <div
                          className="absolute top-[5%] left-[40%] w-[20%] h-[15%] border-2 border-dashed border-primary rounded-full cursor-pointer hover:bg-primary/20 hover:scale-105 transition-all"
                          onClick={() => handleBodyPartSelect("头部")}
                          title="头部"
                        ></div>

                        <div
                          className="absolute top-[25%] left-[30%] w-[40%] h-[30%] border-2 border-dashed border-primary rounded-lg cursor-pointer hover:bg-primary/20 hover:scale-105 transition-all"
                          onClick={() => handleBodyPartSelect("上身")}
                          title="上身"
                        ></div>

                        <div
                          className="absolute top-[60%] left-[35%] w-[30%] h-[35%] border-2 border-dashed border-primary rounded-lg cursor-pointer hover:bg-primary/20 hover:scale-105 transition-all"
                          onClick={() => handleBodyPartSelect("下身")}
                          title="下身"
                        ></div>

                        <div
                          className="absolute top-[20%] left-[20%] w-[60%] h-[75%] border-2 border-dashed border-blue-500 rounded-lg cursor-pointer hover:bg-blue-500/20 hover:scale-105 transition-all"
                          onClick={() => handleBodyPartSelect("全身")}
                          title="全身"
                        ></div>

                        <div
                          className="absolute top-[26%] left-[5%] w-[15%] h-[30%] border-2 border-dashed border-green-500 rounded-lg cursor-pointer hover:bg-green-500/20 hover:scale-105 transition-all"
                          onClick={() => handleBodyPartSelect("手部")}
                          title="手部"
                        ></div>

                        <div
                          className="absolute top-[80%] left-[35%] w-[30%] h-[15%] border-2 border-dashed border-green-500 rounded-lg cursor-pointer hover:bg-green-500/20 hover:scale-105 transition-all"
                          onClick={() => handleBodyPartSelect("脚部")}
                          title="脚部"
                        ></div>
                      </div>

                      {visualSubcategory && (
                        <div className="mt-4">
                          <p className="text-center font-medium">
                            已选择: {visualSubcategory}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {visualCategory === "人物动作" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>选择人物动作</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <Button
                        variant={
                          visualSubcategory === "站立" ? "default" : "outline"
                        }
                        onClick={() => handleActionSelect("站立")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>站立</span>
                        <span className="text-xs opacity-70">Standing</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "坐姿" ? "default" : "outline"
                        }
                        onClick={() => handleActionSelect("坐姿")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>坐姿</span>
                        <span className="text-xs opacity-70">Sitting</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "行走" ? "default" : "outline"
                        }
                        onClick={() => handleActionSelect("行走")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>行走</span>
                        <span className="text-xs opacity-70">Walking</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "跑步" ? "default" : "outline"
                        }
                        onClick={() => handleActionSelect("跑步")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>跑步</span>
                        <span className="text-xs opacity-70">Running</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "跳跃" ? "default" : "outline"
                        }
                        onClick={() => handleActionSelect("跳跃")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>跳跃</span>
                        <span className="text-xs opacity-70">Jumping</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "舞蹈" ? "default" : "outline"
                        }
                        onClick={() => handleActionSelect("舞蹈")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>舞蹈</span>
                        <span className="text-xs opacity-70">Dancing</span>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {visualCategory === "服饰" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>选择服饰</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <Button
                        variant={
                          visualSubcategory === "正式" ? "default" : "outline"
                        }
                        onClick={() => handleClothingSelect("正式")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>正式服装</span>
                        <span className="text-xs opacity-70">Formal</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "休闲" ? "default" : "outline"
                        }
                        onClick={() => handleClothingSelect("休闲")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>休闲服装</span>
                        <span className="text-xs opacity-70">Casual</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "运动" ? "default" : "outline"
                        }
                        onClick={() => handleClothingSelect("运动")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>运动服</span>
                        <span className="text-xs opacity-70">Sports</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "制服" ? "default" : "outline"
                        }
                        onClick={() => handleClothingSelect("制服")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>制服</span>
                        <span className="text-xs opacity-70">Uniform</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "特殊" ? "default" : "outline"
                        }
                        onClick={() => handleClothingSelect("特殊")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>特殊服装</span>
                        <span className="text-xs opacity-70">Special</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "传统" ? "default" : "outline"
                        }
                        onClick={() => handleClothingSelect("传统")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>传统服装</span>
                        <span className="text-xs opacity-70">Traditional</span>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {visualCategory === "场景" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>选择场景</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <Button
                        variant={
                          visualSubcategory === "自然" ? "default" : "outline"
                        }
                        onClick={() => handleSceneSelect("自然")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>自然场景</span>
                        <span className="text-xs opacity-70">Nature</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "城市" ? "default" : "outline"
                        }
                        onClick={() => handleSceneSelect("城市")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>城市场景</span>
                        <span className="text-xs opacity-70">City</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "室内" ? "default" : "outline"
                        }
                        onClick={() => handleSceneSelect("室内")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>室内场景</span>
                        <span className="text-xs opacity-70">Indoor</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "奇幻" ? "default" : "outline"
                        }
                        onClick={() => handleSceneSelect("奇幻")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>奇幻场景</span>
                        <span className="text-xs opacity-70">Fantasy</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "太空" ? "default" : "outline"
                        }
                        onClick={() => handleSceneSelect("太空")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>太空场景</span>
                        <span className="text-xs opacity-70">Space</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "水下" ? "default" : "outline"
                        }
                        onClick={() => handleSceneSelect("水下")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>水下场景</span>
                        <span className="text-xs opacity-70">Underwater</span>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {visualCategory === "光照" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>选择光照</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <Button
                        variant={
                          visualSubcategory === "日光" ? "default" : "outline"
                        }
                        onClick={() => handleLightingSelect("日光")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>日光</span>
                        <span className="text-xs opacity-70">Daylight</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "夜晚" ? "default" : "outline"
                        }
                        onClick={() => handleLightingSelect("夜晚")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>夜晚</span>
                        <span className="text-xs opacity-70">Night</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "黄昏" ? "default" : "outline"
                        }
                        onClick={() => handleLightingSelect("黄昏")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>黄昏</span>
                        <span className="text-xs opacity-70">Sunset</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "霓虹" ? "default" : "outline"
                        }
                        onClick={() => handleLightingSelect("霓虹")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>霓虹</span>
                        <span className="text-xs opacity-70">Neon</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "柔光" ? "default" : "outline"
                        }
                        onClick={() => handleLightingSelect("柔光")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>柔光</span>
                        <span className="text-xs opacity-70">Soft light</span>
                      </Button>
                      <Button
                        variant={
                          visualSubcategory === "强光" ? "default" : "outline"
                        }
                        onClick={() => handleLightingSelect("强光")}
                        className="h-20 flex flex-col gap-1"
                      >
                        <span>强光</span>
                        <span className="text-xs opacity-70">Strong light</span>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>推荐标签</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {recommendedTags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          onClick={() => addVisualTag(tag)}
                          className="cursor-pointer"
                        >
                          {tag.tag_cn} ({tag.tag_en})
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 右侧已选可视化标签 */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>已选可视化标签</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 min-h-20">
                      {selectedVisualTags.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 w-full text-center py-4">
                          暂无已选可视化标签，请从左侧选择
                        </p>
                      ) : (
                        selectedVisualTags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <span>
                              {tag.tag_cn} ({tag.tag_en})
                            </span>
                            <X
                              size={14}
                              className="cursor-pointer"
                              onClick={() => removeVisualTag(tag)}
                            />
                          </Badge>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 一键组合页 */}
          <TabsContent value="combination">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左侧预设组合 */}
              <div className="lg:col-span-1">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>预设组合</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {predefinedCombinations.map((combination) => (
                        <Button
                          key={combination.name}
                          variant="outline"
                          onClick={() =>
                            applyPredefinedCombination(combination)
                          }
                        >
                          {combination.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 右侧用户自定义组合 */}
              <div className="lg:col-span-1">
                <Card className="mb-6">
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>我的组合</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCombinationDialog(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      新建组合
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {userCombinations.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 w-full text-center py-4">
                          暂无自定义组合，请点击新建组合
                        </p>
                      ) : (
                        userCombinations.map((combination) => (
                          <div
                            key={combination.id}
                            className="flex items-center justify-between"
                          >
                            <Button
                              variant="outline"
                              onClick={() => applyUserCombination(combination)}
                            >
                              {combination.name}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                deleteUserCombination(combination.id)
                              }
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 历史记录页 */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>历史记录</CardTitle>
              </CardHeader>
              <CardContent>
                {promptHistory.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 w-full text-center py-4">
                    暂无历史记录，生成提示词后将在此显示
                  </p>
                ) : (
                  <div className="space-y-4">
                    {promptHistory.map((item, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <h4 className="font-medium">
                          {new Date().toLocaleTimeString()} -{" "}
                          {item.tags.map((tag) => tag.tag_cn).join(", ")}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {item.en}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPrompt(item.en)}
                        >
                          <Copy size={16} className="mr-2" />
                          复制
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 保存组合对话框 */}
        <Dialog
          open={showCombinationDialog}
          onOpenChange={setShowCombinationDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>保存自定义组合</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="组合名称"
              value={combinationName}
              onChange={(e) => setCombinationName(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={saveUserCombination}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 最近使用标签 */}
        {recentlyUsedTags.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>最近使用标签</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recentlyUsedTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    onClick={() => addTag(tag)}
                    className="cursor-pointer"
                  >
                    {tag.tag_cn} ({tag.tag_en})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* 快速操作浮动按钮 */}
      <div className="fixed bottom-6 right-6 z-50">
        <div
          className={`absolute bottom-full right-0 mb-2 ${
            showQuickActions
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          } transition-all duration-300 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2 w-48 border`}
        >
          <div className="space-y-1">
            <button
              className="flex items-center gap-2 w-full p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              onClick={() => {
                if (selectedTags.length > 0) {
                  generatePrompt();
                } else {
                  toast({
                    title: "未选择标签",
                    description: "请至少选择一个标签来生成提示词",
                    variant: "destructive",
                  });
                }
                setShowQuickActions(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              生成提示词
            </button>
            <button
              className="flex items-center gap-2 w-full p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              onClick={() => {
                setShowCombinationDialog(true);
                setShowQuickActions(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              保存组合
            </button>
            <button
              className="flex items-center gap-2 w-full p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              onClick={() => {
                clearSelectedTags();
                setShowQuickActions(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              清空标签
            </button>
          </div>
        </div>

        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setShowQuickActions(!showQuickActions)}
        >
          {showQuickActions ? (
            <X size={24} />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          )}
        </Button>
      </div>
      {/* 看板娘 */}
      {showMascot && (
        <div className="fixed bottom-4 left-4 z-50 flex items-end">
          <div
            className={`relative transition-all duration-300 ${
              mascotAnimation === "bounce"
                ? "animate-bounce"
                : mascotAnimation === "wave"
                ? "animate-pulse"
                : ""
            }`}
          >
            {/* 消息气泡 */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 w-48 text-sm">
              <p className="text-center">{mascotMessage}</p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700"></div>
            </div>

            {/* 看板娘图像 */}
            <div
              className="relative w-24 h-32 bg-primary/10 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => {
                // 随机选择一条消息
                const messages = [
                  "需要帮助生成提示词吗？",
                  "试试调整标签权重！",
                  "可以拖拽标签改变顺序哦~",
                  "记得保存你喜欢的组合！",
                  "按Ctrl+G可以快速生成提示词！",
                ];
                const randomMessage =
                  messages[Math.floor(Math.random() * messages.length)];
                setMascotMessage(randomMessage);
                setMascotAnimation("bounce");
                setTimeout(() => setMascotAnimation("idle"), 1000);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <circle cx="12" cy="8" r="5"></circle>
                <path d="M20 21v-2a7 7 0 0 0-14 0v2"></path>
              </svg>

              {/* 关闭按钮 */}
              <button
                className="absolute -top-1 -right-1 bg-slate-200 dark:bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMascot(false);
                }}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      {showMascot && (
        <KanbanMusume
          onClose={() => setShowMascot(false)}
          onInteract={() => {
            // 如果用户有选择标签但还没生成提示词，提示生成
            if (selectedTags.length > 0 && !generatedPrompt.en) {
              setMascotMessage("已选择标签，可以生成提示词了！");
            }
          }}
        />
      )}
    </main>
  );
}
