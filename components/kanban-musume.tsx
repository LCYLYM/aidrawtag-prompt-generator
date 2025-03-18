"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface KanbanMusumeProps {
  initialMessage?: string;
  onClose?: () => void;
  onInteract?: () => void;
}

export function KanbanMusume({
  initialMessage = "欢迎使用AI绘图提示词辅助工具！",
  onClose,
  onInteract,
}: KanbanMusumeProps) {
  const [message, setMessage] = useState(initialMessage);
  const [animation, setAnimation] = useState<"idle" | "bounce" | "wave">(
    "idle"
  );
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const mascotRef = useRef<HTMLDivElement>(null);

  // 使用useEffect来处理window对象相关的操作，确保只在客户端执行
  useEffect(() => {
    // 初始化位置
    setPosition({
      x: window.innerWidth - 150,
      y: window.innerHeight - 200,
    });

    // 其他需要window对象的初始化代码
  }, []);

  // 随机消息列表
  const randomMessages = [
    "需要帮助生成提示词吗？",
    "试试调整标签权重！",
    "可以拖拽标签改变顺序哦~",
    "记得保存你喜欢的组合！",
    "按Ctrl+G可以快速生成提示词！",
    "有什么需要帮助的吗？",
    "试试可视化选择功能吧！",
    "标签可以拖拽排序哦~",
    "记得保存你常用的组合！",
    "提示词已经生成了吗？",
  ];

  // 随机显示消息
  const showRandomMessage = () => {
    const randomMessage =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];
    setMessage(randomMessage);
    setAnimation("bounce");
    setTimeout(() => setAnimation("idle"), 1000);
    if (onInteract) onInteract();
  };

  // 定时显示随机消息
  useEffect(() => {
    const messageInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30%的概率显示随机消息
        showRandomMessage();
      }
    }, 20000); // 每20秒检查一次

    return () => clearInterval(messageInterval);
  }, []);

  // 处理拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // 处理拖拽移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // 边界检查，确保看板娘不会被拖出屏幕
        const maxX =
          window.innerWidth - (mascotRef.current?.offsetWidth || 100);
        const maxY =
          window.innerHeight - (mascotRef.current?.offsetHeight || 100);

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      // 确保看板娘不会因窗口大小变化而跑出屏幕
      const maxX = window.innerWidth - (mascotRef.current?.offsetWidth || 100);
      const maxY =
        window.innerHeight - (mascotRef.current?.offsetHeight || 100);

      setPosition((prev: { x: number; y: number }) => ({
        x: Math.max(0, Math.min(prev.x, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY)),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 处理关闭
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      ref={mascotRef}
      className="fixed z-50 select-none"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      <div
        className={`relative transition-all duration-300 ${
          animation === "bounce"
            ? "animate-bounce"
            : animation === "wave"
            ? "animate-pulse"
            : ""
        }`}
      >
        {/* 消息气泡 */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 min-w-48 max-w-60 text-sm">
          <p className="text-center">{message}</p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700"></div>
        </div>

        {/* 看板娘图像 */}
        <div
          className="relative w-24 h-32 bg-primary/10 rounded-full flex items-center justify-center cursor-move"
          onMouseDown={handleMouseDown}
          onClick={showRandomMessage}
        >
          {/* 这里使用一个简单的动漫风格人物SVG，实际应用中可以替换为更精美的图片 */}
          <div className="relative w-20 h-28">
            {/* 头部 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-pink-200 dark:bg-pink-300 rounded-full overflow-hidden border-2 border-slate-700">
              {/* 眼睛 */}
              <div className="absolute top-6 left-3 w-3 h-4 bg-slate-800 rounded-full"></div>
              <div className="absolute top-6 right-3 w-3 h-4 bg-slate-800 rounded-full"></div>
              {/* 嘴巴 */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-2 bg-red-400 rounded-full"></div>
              {/* 头发 */}
              <div className="absolute top-0 left-0 w-full h-6 bg-slate-700"></div>
              <div className="absolute top-0 left-0 w-4 h-10 bg-slate-700 rounded-br-full"></div>
              <div className="absolute top-0 right-0 w-4 h-10 bg-slate-700 rounded-bl-full"></div>
            </div>

            {/* 身体 */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-14 bg-blue-400 rounded-t-lg">
              {/* 衣领 */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-3 bg-white rounded-b-lg"></div>
            </div>
          </div>

          {/* 关闭按钮 */}
          <button
            className="absolute -top-1 -right-1 bg-slate-200 dark:bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer z-10"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
