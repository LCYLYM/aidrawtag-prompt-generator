
# 🎨 AI绘图提示词生成器 🚀

![GitHub stars](https://img.shields.io/github/stars/yourname/aidrawtag-prompt-generator?style=social)
![Version](https://img.shields.io/badge/版本-1.0.0-blue)
![Next.js](https://img.shields.io/badge/-Next.js-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![img](https://github.com/LCYLYM/aidrawtag-prompt-generator/blob/main/showimg/e4be52e0e15193b736bb1364c14d473.png)
> 📝 深夜coding，突发奇想做出来的小工具。当你对着AI画图软件发呆，不知道输入什么提示词时，这个工具会是你的救星！

## ⚠️ 友情提示 ⚠️

本项目使用了从某位群友那里~~偷来~~借来的神秘数据集，可能包含一些奇奇怪怪的R18标签。我对这些内容概不负责，毕竟我也不知道这些数据是从哪个次元漂流过来的...

如果你是纯洁的小朋友，请在大人的陪同下使用，或者自行替换数据源～(￣▽￣～)~

## ✨ 有什么厉害的地方？

- 🔍 **多级分类系统** - 人物部位、服饰、场景等多层次标签，想要什么👉就点什么
- 🌐 **中英双语支持** - 中英文标签无缝切换，轻松应对国内外AI模型
- 🧠 **智能组合算法** - 自动按照黄金比例组合出最优提示词
- ⚖️ **权重精确控制** - 想让哪个特征更明显？拖拽调整权重就搞定
- 💾 **预设组合库** - 内置多种经典场景预设，让你的灵感源源不断

## 🚀 两步上天

### 前置要求

- Node.js (v16+) - _没有的话赶紧装一个吧_
- Python 3.6+ - _数据处理需要用到_
- pandas库 - `pip install pandas` _用来处理数据的好帮手_

### 1️⃣ 安装依赖

```bash
# 先切换到项目目录
cd aidrawtag-prompt-generator

# 安装所有依赖
npm install

# 如果npm报错，试试这个魔法咒语
npm install --legacy-peer-deps
```

### 2️⃣ 启动应用

```bash
# 一键启动
node start.js

# 或者用npm脚本
npm run app
```

启动后访问 http://localhost:3000 开始你的AI绘画之旅！🎉

## 🛠️ 遇到问题？

### 依赖问题处理

如果安装依赖时遇到类似如下报错：

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

试试这些解决方案：

```bash
# 方案1：使用传说中的--legacy-peer-deps
npm install --legacy-peer-deps

# 方案2：暴力模式--force
npm install --force
```

### 数据处理（可选）

想用自己的数据？可以这样处理：

```bash
# 确保Excel文件在正确位置
# 3_Tags宝典（24.10.3）(3).xlsx
# Stable Diffusion 提示詞與模型.xlsx
# 不知道哪里来的Tags宝典 (1).xlsx

# 运行处理脚本
node process-data.js

# 或者用npm脚本
npm run process
```

## 📂 项目结构

```
/app            - Next.js前端应用（灵魂所在）
/components     - UI组件（颜值担当）
/data           - 处理后的JSON数据（知识库）
data-processor.py  - 数据处理脚本（数据魔法师）
process-data.js    - 数据处理启动脚本（魔法触发器）
start.js           - 应用启动脚本（一键启动）
```

## 🩺 问题诊断

1. **找不到data目录**
   - 运行 `npm run process` 处理数据
   - 或者检查你是不是把文件夹删了？

2. **启动失败或依赖问题**
   - 确保运行了 `npm install --legacy-peer-deps`
   - 检查Node.js版本是否为v16+
   - 试试关掉电脑重启（古老而有效的方法）

3. **数据处理失败**
   - 确保Excel文件在项目根目录
   - 检查是否安装了pandas库 (`pip install pandas`)
   - 检查Excel文件是否被打开（被锁定）

---

> 🌟 如果你喜欢这个项目，别忘了点个星标！有任何想法或建议，请随时提交issue～
