import pandas as pd
import json
import re
from collections import defaultdict
import os

# 人物部位关键词定义
BODY_PARTS = {
    '头部': ['head', 'face', 'hair', 'eye', 'eyes', 'nose', 'mouth', 'ear', 'ears', 'neck',
           '头', '脸', '头发', '眼睛', '鼻子', '嘴', '耳朵', '脖子', '表情', '头饰'],
    '上身': ['shoulder', 'shoulders', 'chest', 'breast', 'breasts', 'arm', 'arms', 'hand', 'hands', 'finger', 'fingers',
           '肩膀', '胸', '胸部', '手臂', '手', '手指', '上半身', '腰'],
    '下身': ['leg', 'legs', 'foot', 'feet', 'thigh', 'thighs', 'calf', 'calves', 'knee', 'knees', 'toe', 'toes', 'hip', 'hips',
           '腿', '脚', '大腿', '小腿', '膝盖', '脚趾', '臀部', '下半身'],
    '全身': ['body', 'figure', 'posture', 'pose', 'stance', 'physique', 'build',
           '身体', '体型', '姿势', '姿态', '体格', '全身']
}

# 人物动作关键词定义
ACTIONS = {
    '站立': ['stand', 'standing', 'upright', 'erect', 
           '站立', '站着', '直立'],
    '坐姿': ['sit', 'sitting', 'seated', 
           '坐', '坐着', '就座'],
    '卧姿': ['lie', 'lying', 'recline', 'recumbent', 'prone', 'supine',
           '躺', '躺着', '卧', '卧倒'],
    '行走': ['walk', 'walking', 'stride', 'striding', 
           '走', '行走', '步行', '迈步'],
    '跑步': ['run', 'running', 'jog', 'jogging', 'sprint', 'sprinting',
           '跑', '跑步', '奔跑', '冲刺'],
    '跳跃': ['jump', 'jumping', 'leap', 'leaping', 'hop', 'hopping',
           '跳', '跳跃', '腾空', '跃起'],
    '舞蹈': ['dance', 'dancing', 'ballet', 
           '舞', '舞蹈', '跳舞', '芭蕾'],
    '弯腰': ['bend', 'bending', 'stoop', 'stooping', 'crouch', 'crouching',
           '弯腰', '弯身', '俯身', '蹲'],
    '伸展': ['stretch', 'stretching', 'extend', 'extending', 
           '伸展', '延伸', '拉伸'],
    '打架': ['fight', 'fighting', 'punch', 'punching', 'kick', 'kicking',
           '打', '打架', '格斗', '踢', '出拳'],
    '拥抱': ['hug', 'hugging', 'embrace', 'embracing',
           '拥抱', '抱', '搂抱'],
    '亲吻': ['kiss', 'kissing', 'peck',
           '吻', '亲吻', '亲', '接吻']
}

# 服饰关键词定义
CLOTHING = {
    '上装': ['shirt', 'blouse', 'top', 't-shirt', 'sweater', 'jacket', 'coat', 'hoodie',
           '衬衫', '上衣', 'T恤', '毛衣', '夹克', '外套', '连帽衫'],
    '下装': ['pants', 'trousers', 'jeans', 'shorts', 'skirt', 'leggings',
           '裤子', '牛仔裤', '短裤', '裙子', '紧身裤'],
    '连体装': ['dress', 'jumpsuit', 'romper', 'overalls', 'uniform', 'suit',
             '连衣裙', '连体裤', '工装连体裤', '制服', '套装'],
    '内衣': ['bra', 'underwear', 'panties', 'briefs', 'boxer', 'lingerie',
           '胸罩', '内衣', '内裤', '三角裤', '平角裤', '情趣内衣'],
    '鞋袜': ['shoe', 'shoes', 'sock', 'socks', 'boot', 'boots', 'heel', 'heels', 'sneaker', 'sneakers',
           '鞋', '袜子', '靴子', '高跟鞋', '运动鞋'],
    '配饰': ['hat', 'cap', 'scarf', 'glove', 'gloves', 'jewelry', 'necklace', 'earring', 'ring', 'bracelet',
           '帽子', '围巾', '手套', '珠宝', '项链', '耳环', '戒指', '手镯']
}

# 场景关键词定义
SCENES = {
    '自然': ['nature', 'forest', 'mountain', 'river', 'lake', 'ocean', 'sea', 'beach', 'sky', 'cloud',
           '自然', '森林', '山', '河', '湖', '海洋', '海', '沙滩', '天空', '云'],
    '城市': ['city', 'urban', 'street', 'building', 'skyscraper', 'downtown', 'suburb', 'neighborhood',
           '城市', '市区', '街道', '建筑', '摩天大楼', '市中心', '郊区', '社区'],
    '室内': ['indoor', 'room', 'living room', 'bedroom', 'bathroom', 'kitchen', 'office', 'classroom',
           '室内', '房间', '客厅', '卧室', '浴室', '厨房', '办公室', '教室'],
    '幻想': ['fantasy', 'magical', 'surreal', 'dreamlike', 'otherworldly', 'mythical', 'legendary',
           '幻想', '魔幻', '超现实', '梦境', '异世界', '神话', '传说']
}

# 艺术风格关键词定义
STYLES = {
    '现实主义': ['realism', 'realistic', 'photorealistic', 'hyperrealistic', 'lifelike',
              '现实主义', '写实', '照片级', '超写实', '逼真'],
    '卡通': ['cartoon', 'animated', 'anime', 'manga', 'comic',
           '卡通', '动画', '动漫', '漫画', '漫'],
    '抽象': ['abstract', 'non-representational', 'non-figurative', 'non-objective',
           '抽象', '非具象', '非形象'],
    '印象派': ['impressionism', 'impressionistic', 
             '印象派', '印象主义'],
    '表现主义': ['expressionism', 'expressionist',
              '表现主义'],
    '超现实主义': ['surrealism', 'surrealist', 'dreamlike',
               '超现实主义', '梦境般'],
    '赛博朋克': ['cyberpunk', 'cyber', 'futuristic', 'neon',
              '赛博朋克', '未来主义', '霓虹'],
    '奇幻': ['fantasy', 'magical', 'mystical', 'enchanted',
           '奇幻', '魔幻', '神秘', '魔法'],
    '科幻': ['sci-fi', 'science fiction', 'futuristic', 'space',
           '科幻', '科学幻想', '未来', '太空']
}

# 质量关键词定义
QUALITY = {
    '高质量': ['high quality', 'hq', 'masterpiece', 'best quality', 'detailed', 'intricate', 'fine detail',
            '高质量', '杰作', '最佳质量', '细节', '精细', '精致'],
    '低质量': ['low quality', 'lq', 'worst quality', 'blurry', 'pixelated', 'artifacts', 'noise',
            '低质量', '最差质量', '模糊', '像素化', '噪点']
}

def clean_text(text):
    """清理文本，删除多余的空格，统一格式"""
    if not isinstance(text, str):
        return ""
    # 删除首尾空格
    text = text.strip()
    # 将多个空格替换为单个空格
    text = re.sub(r'\s+', ' ', text)
    return text

def is_valid_tag(tag):
    """检查标签是否有效"""
    if not tag or not isinstance(tag, str):
        return False
    # 如果只包含空格、标点符号等，也视为无效
    if re.match(r'^[\s\.,;:!?，。；：！？]+$', tag):
        return False
    return True

def detect_category(tag_en, tag_cn):
    """检测标签应该属于哪个大类"""
    tag_text = (tag_en + " " + tag_cn).lower()
    
    # 检查是否属于人物部位
    for part, keywords in BODY_PARTS.items():
        if any(keyword in tag_text for keyword in keywords):
            return "人物部位", part
    
    # 检查是否属于人物动作
    for action, keywords in ACTIONS.items():
        if any(keyword in tag_text for keyword in keywords):
            return "人物动作", action
    
    # 检查是否属于服饰
    for clothing_type, keywords in CLOTHING.items():
        if any(keyword in tag_text for keyword in keywords):
            return "服饰", clothing_type
    
    # 检查是否属于场景
    for scene_type, keywords in SCENES.items():
        if any(keyword in tag_text for keyword in keywords):
            return "场景", scene_type
    
    # 检查是否属于艺术风格
    for style_type, keywords in STYLES.items():
        if any(keyword in tag_text for keyword in keywords):
            return "艺术风格", style_type
    
    # 检查是否属于质量
    for quality_type, keywords in QUALITY.items():
        if any(keyword in tag_text for keyword in keywords):
            return "质量", quality_type
    
    return "其他", "未分类"

def merge_tags(tag1, tag2):
    """合并两个标签的信息"""
    merged_tag = tag1.copy()
    
    # 如果tag1的某个字段为空但tag2有值，则使用tag2的值
    if not merged_tag.get('tag_en') and tag2.get('tag_en'):
        merged_tag['tag_en'] = tag2['tag_en']
    
    if not merged_tag.get('tag_cn') and tag2.get('tag_cn'):
        merged_tag['tag_cn'] = tag2['tag_cn']
    
    if not merged_tag.get('description') and tag2.get('description', ''):
        merged_tag['description'] = tag2['description']
    
    # 合并来源信息
    if 'source' in merged_tag and 'source' in tag2 and merged_tag['source'] != tag2['source']:
        merged_tag['source'] = f"{merged_tag['source']}, {tag2['source']}"
    
    # 权重取最大值
    if 'weight' in merged_tag and 'weight' in tag2:
        merged_tag['weight'] = max(merged_tag.get('weight', 1.0), tag2.get('weight', 1.0))
    
    return merged_tag

def process_excel_files():
    """处理所有Excel文件并返回整合后的数据"""
    print("正在读取Excel文件...")
    
    # 获取当前目录的完整路径
    current_dir = os.getcwd()
    
    # 指定Excel文件路径
    file1_path = os.path.join(current_dir, 'Stable Diffusion 提示詞與模型.xlsx')
    file2_path = os.path.join(current_dir, '3_Tags宝典（24.10.3）(3).xlsx')
    file3_path = os.path.join(current_dir, '不知道哪里来的Tags宝典 (1).xlsx')
    
    # 读取三个Excel文件
    try:
        df1 = pd.read_excel(file1_path)
        print(f"成功读取 {file1_path}")
    except Exception as e:
        print(f"读取 {file1_path} 失败: {e}")
        df1 = pd.DataFrame()
    
    try:
        df2 = pd.read_excel(file2_path)
        print(f"成功读取 {file2_path}")
    except Exception as e:
        print(f"读取 {file2_path} 失败: {e}")
        df2 = pd.DataFrame()
    
    try:
        df3 = pd.read_excel(file3_path)
        print(f"成功读取 {file3_path}")
    except Exception as e:
        print(f"读取 {file3_path} 失败: {e}")
        df3 = pd.DataFrame()
    
    print("正在清理和处理数据...")
    
    # 清理数据
    df1.fillna('', inplace=True)
    df2.fillna('', inplace=True)
    df3.fillna('', inplace=True)
    
    # 创建临时存储所有标签的列表
    all_tags = []
    
    # 处理第一个文件 - Stable Diffusion 提示詞與模型.xlsx
    if not df1.empty:
        for col in df1.columns:
            if col != '-' and not col.startswith('Unnamed'):
                orig_category = col
                for i in range(len(df1)):
                    tag_value = df1.iloc[i][col]
                    if is_valid_tag(tag_value):
                        # 判断是英文还是中文
                        is_en = bool(re.search(r'[a-zA-Z]', tag_value))
                        tag_en = tag_value if is_en else ""
                        tag_cn = "" if is_en else tag_value
                        
                        all_tags.append({
                            'tag_en': clean_text(tag_en),
                            'tag_cn': clean_text(tag_cn),
                            'description': '',
                            'weight': 1.0,  # 默认权重
                            'source': 'Stable Diffusion 提示詞與模型',
                            'orig_category': orig_category
                        })
    
    # 处理第二个和第三个文件 - 它们似乎有相似的结构
    for idx, (df, source) in enumerate([(df2, '3_Tags宝典'), (df3, '不知道哪里来的Tags宝典')]):
        if not df.empty:
            for col_idx in range(0, len(df.columns), 2):
                if col_idx + 1 < len(df.columns):
                    col_en = df.columns[col_idx]
                    col_cn = df.columns[col_idx + 1] if not pd.isna(df.columns[col_idx + 1]) else ""
                    
                    if pd.isna(col_en) or col_en.startswith('Unnamed'):
                        continue
                    
                    orig_category = col_en if col_en else "未分类"
                    
                    for i in range(len(df)):
                        tag_en = clean_text(str(df.iloc[i, col_idx])) if not pd.isna(df.iloc[i, col_idx]) else ""
                        tag_cn = clean_text(str(df.iloc[i, col_idx + 1])) if col_idx + 1 < len(df.columns) and not pd.isna(df.iloc[i, col_idx + 1]) else ""
                        
                        if is_valid_tag(tag_en) or is_valid_tag(tag_cn):
                            all_tags.append({
                                'tag_en': tag_en,
                                'tag_cn': tag_cn,
                                'description': '',
                                'weight': 1.0,  # 默认权重
                                'source': source,
                                'orig_category': orig_category
                            })
    
    # 对所有标签进行优化和分类
    print("正在优化和细化分类标签...")
    
    # 合并重复标签
    unique_tags = {}
    for tag in all_tags:
        key = f"{tag['tag_en']}|{tag['tag_cn']}"
        if key in unique_tags:
            unique_tags[key] = merge_tags(unique_tags[key], tag)
            unique_tags[key]['count'] = unique_tags[key].get('count', 1) + 1
        else:
            tag['count'] = 1
            unique_tags[key] = tag
    
    # 创建最终分类数据结构
    result = {
        "人物部位": defaultdict(list),
        "人物动作": defaultdict(list),
        "服饰": defaultdict(list),
        "场景": defaultdict(list),
        "艺术风格": defaultdict(list),
        "质量": defaultdict(list),
        "其他": defaultdict(list)
    }
    
    # 按照新的分类方式重新组织标签
    for tag in unique_tags.values():
        # 设置权重 - 出现次数越多，权重越高
        tag['weight'] = min(1.0 + (tag.get('count', 1) - 1) * 0.1, 2.0)  # 最高权重为2.0
        
        # 检测标签应该属于哪个大类和子类
        main_category, sub_category = detect_category(tag.get('tag_en', ''), tag.get('tag_cn', ''))
        
        # 添加到相应的分类中
        result[main_category][sub_category].append({
            'tag_en': tag.get('tag_en', ''),
            'tag_cn': tag.get('tag_cn', ''),
            'weight': tag.get('weight', 1.0),
            'description': tag.get('description', '')
        })
    
    # 对每个子分类中的标签按权重排序
    for main_category in result:
        for sub_category in result[main_category]:
            result[main_category][sub_category] = sorted(
                result[main_category][sub_category], 
                key=lambda x: x['weight'], 
                reverse=True
            )
    
    # 将defaultdict转换为普通dict
    for main_category in result:
        result[main_category] = dict(result[main_category])
    
    return result

def save_to_json(data, filename='processed_tags_data.json'):
    """将数据保存为JSON文件"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"数据已保存到 {filename}")

def save_flat_tags_for_search(data, filename='search_tags_data.json'):
    """将标签数据保存为扁平结构，方便搜索"""
    flat_tags = []
    
    for main_category, sub_categories in data.items():
        for sub_category, tags in sub_categories.items():
            for tag in tags:
                flat_tags.append({
                    'main_category': main_category,
                    'sub_category': sub_category,
                    'tag_en': tag.get('tag_en', ''),
                    'tag_cn': tag.get('tag_cn', ''),
                    'weight': tag.get('weight', 1.0),
                    'description': tag.get('description', '')
                })
    
    # 按权重排序
    flat_tags.sort(key=lambda x: x.get('weight', 1.0), reverse=True)
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(flat_tags, f, ensure_ascii=False, indent=2)
    print(f"搜索数据已保存到 {filename}")

def save_category_structure(data, filename='structure_data.json'):
    """保存分类结构"""
    structure = {}
    for main_category, sub_categories in data.items():
        structure[main_category] = list(sub_categories.keys())
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(structure, f, ensure_ascii=False, indent=2)
    print(f"分类结构已保存到 {filename}")

def generate_predefined_combinations(filename='predefined_combinations.json'):
    """生成预定义组合"""
    combinations = [
        {
            "name": "动漫风格少女",
            "tags": [
                {"main_category": "人物部位", "sub_category": "头部", "tag_en": "anime face", "tag_cn": "动漫脸"},
                {"main_category": "人物部位", "sub_category": "全身", "tag_en": "beautiful girl", "tag_cn": "美少女"},
                {"main_category": "艺术风格", "sub_category": "卡通", "tag_en": "anime style", "tag_cn": "动漫风格"},
                {"main_category": "质量", "sub_category": "高质量", "tag_en": "masterpiece", "tag_cn": "杰作"}
            ]
        },
        {
            "name": "自然风景",
            "tags": [
                {"main_category": "场景", "sub_category": "自然", "tag_en": "beautiful landscape", "tag_cn": "美丽风景"},
                {"main_category": "场景", "sub_category": "自然", "tag_en": "mountains", "tag_cn": "山脉"},
                {"main_category": "场景", "sub_category": "自然", "tag_en": "lake", "tag_cn": "湖泊"},
                {"main_category": "质量", "sub_category": "高质量", "tag_en": "high quality", "tag_cn": "高质量"}
            ]
        },
        {
            "name": "科幻城市",
            "tags": [
                {"main_category": "场景", "sub_category": "城市", "tag_en": "futuristic city", "tag_cn": "未来城市"},
                {"main_category": "艺术风格", "sub_category": "科幻", "tag_en": "sci-fi", "tag_cn": "科幻"},
                {"main_category": "艺术风格", "sub_category": "赛博朋克", "tag_en": "cyberpunk", "tag_cn": "赛博朋克"},
                {"main_category": "质量", "sub_category": "高质量", "tag_en": "detailed", "tag_cn": "细节"}
            ]
        },
        {
            "name": "写实人像",
            "tags": [
                {"main_category": "人物部位", "sub_category": "头部", "tag_en": "realistic face", "tag_cn": "写实脸部"},
                {"main_category": "人物部位", "sub_category": "全身", "tag_en": "human", "tag_cn": "人类"},
                {"main_category": "艺术风格", "sub_category": "现实主义", "tag_en": "photorealistic", "tag_cn": "照片级写实"},
                {"main_category": "质量", "sub_category": "高质量", "tag_en": "high detail", "tag_cn": "高细节"}
            ]
        }
    ]
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(combinations, f, ensure_ascii=False, indent=2)
    print(f"预定义组合已保存到 {filename}")

def main():
    """主函数"""
    print("开始处理标签数据...")
    
    # 处理Excel文件
    data = process_excel_files()
    
    # 保存为JSON文件
    save_to_json(data)
    
    # 保存扁平结构用于搜索
    save_flat_tags_for_search(data)
    
    # 保存分类结构
    save_category_structure(data)
    
    # 生成预定义组合
    generate_predefined_combinations()
    
    # 打印分类信息
    print("\n处理后的分类统计:")
    for main_category, sub_categories in data.items():
        print(f"\n{main_category}:")
        total_tags = 0
        for sub_category, tags in sub_categories.items():
            print(f"  - {sub_category}: {len(tags)}个标签")
            total_tags += len(tags)
        print(f"  总计: {total_tags}个标签")
    
    print("\n处理完成! 数据已保存到JSON文件。")

if __name__ == "__main__":
    main() 