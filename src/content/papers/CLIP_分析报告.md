---
title: "Learning Transferable Visual Models From Natural Language Supervision"
date: 2026-05-12
arxiv: "2103.00020"
venue: "ICML 2021"
authors: ["Alec Radford", "Jong Wook Kim", "Chris Hallacy", "Aditya Ramesh", "Gabriel Goh", "Sandhini Agarwal", "Girish Sastry", "Amanda Askell", "Pamela Mishkin", "Jack Clark", "Gretchen Krueger", "Ilya Sutskever"]
tags: ["多模态学习", "对比学习", "零样本迁移", "视觉-语言预训练"]
rating: 5
tldr: "用自然语言监督 + 对比学习，让视觉模型实现零样本迁移，无需任何数据集特定训练即可匹配 ResNet-50 全监督性能。"
---

# Learning Transferable Visual Models From Natural Language Supervision

**arXiv**: [2103.00020](https://arxiv.org/abs/2103.00020)
**作者**: Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, Gretchen Krueger, Ilya Sutskever (OpenAI)
**日期**: 2021年（ICML 2021）
**领域**: 多模态技术

## 核心问题

（1）**视觉模型受限于固定类别标签**：传统计算机视觉系统只能预测预定义的固定对象类别（如 ImageNet 的 1000 类）。这种受限的监督形式限制了模型的通用性和可用性——每遇到新的视觉概念就需要额外的标注数据来训练。Mahajan et al.（2018）和 Kolesnikov et al.（2019）虽然用 Instagram 标签等弱监督方式扩展了类别数，但仍然受限于 1000 和 18291 个预定义类别，无法动态输出新概念。

（2）**从自然语言直接学习视觉表征的方法尚未突破**：虽然已有工作（Joulin et al. 2016、Li et al. 2017、VirTex、ICMLM、ConVIRT）探索了从文本中学习视觉表征，但训练规模太小（仅 10-20 万张图片、训练数天），性能远低于监督方法。例如 Visual N-Grams（Li et al. 2017）在 ImageNet 上的零样本准确率仅为 11.5%，远低于当时 SOTA 的 88.4%，甚至低于经典方法的 50%。

（3）**缺乏大规模图文配对数据集**：现有数据集要么太小（MS-COCO 和 Visual Genome 各约 10 万张），要么质量参差不齐（YFCC100M 过滤后仅剩 1500 万张英文图文对，与 ImageNet 规模相当），无法支撑大规模自然语言监督预训练的需求。

## 核心方法（CLIP：Contrastive Language-Image Pre-training）

（1）**构建大规模图文数据集 WIT**：从互联网公开来源收集了 4 亿（image, text）对，构成 WebImageText（WIT）数据集。构建方法是以英语维基百科中至少出现 100 次的所有词为基础查询列表，补充高频双词组和 Wikipedia 文章标题，共约 50 万个查询词，每个查询最多收集 2 万对。WIT 的总词数与训练 GPT-2 的 WebText 数据集相当。

（2）**对比学习替代预测学习**：这是整篇论文最关键的设计决策。作者首先尝试了类似 VirTex 的方法——联合训练图像 CNN 和文本 Transformer 来预测图片的准确标题（caption）。但实验发现，一个 63M 参数的 Transformer 语言模型预测标题时，学习 ImageNet 类别的速度比简单的词袋（Bag-of-Words）基线慢 3 倍。接着将预测目标替换为对比目标——只判断"哪段文本与哪张图片匹配"而非逐词预测文本内容——带来了额外的 4 倍效率提升，合计比预测完整文本快 12 倍。训练目标是 InfoNCE 损失：给定 batch 中 N 对 (image, text)，最大化 N 对真实配对的余弦相似度，同时最小化 N²−N 对错误配对的余弦相似度。

（3）**双编码器架构 + 线性投影到联合空间**：图像编码器使用 ResNet（ResNet-D 改进 + 抗锯齿模糊池化 + 注意力池化层替代全局平均池化）或 Vision Transformer（ViT）。文本编码器使用 63M 参数的 12 层 512 宽 Transformer，在 BPE（49,152 词表）文本上操作，最大序列长度 76，[EOS] token 的最高层激活作为文本特征。两个编码器的输出通过线性投影（而非非线性，作者发现与预训练权重解耦后无差异）映射到 L2 归一化的联合多模态嵌入空间。

（4）**大规模训练策略**：训练了 5 个 ResNet（RN50、RN101、RN50x4、RN50x16、RN50x64）和 3 个 ViT（ViT-B/32、ViT-B/16、ViT-L/14@336px），共 8 个模型，计算量跨越近 2 个数量级。关键配置：Adam 优化器 + 解耦权重衰减 + 余弦学习率衰减，超大 batch size 32,768，训练 32 个 epoch。温度参数 τ 直接作为可学习对数参数优化（初始化 ≈ 0.07），剪裁防止 logits 超过 100。最大模型 RN50x64 在 592 块 V100 GPU 上训练 18 天，ViT-L/14 在 256 块 V100 GPU 上训练 12 天。

（5）**Prompt Engineering 与零样本推理**：零样本分类时，文本编码器将所有可能类别的名称嵌入为特征并缓存，作为零样本线性分类器使用。图像通过图像编码器后与所有文本特征计算余弦相似度，经 softmax 得到预测。作者发现提示模板至关重要——仅用 "A photo of a {label}." 这个默认模板就在 ImageNet 上提升 1.3% 准确率；针对不同数据集定制 prompt（如 OCR "识别引号内文字"、卫星图 "卫星照片" 限定词）进一步改进；在嵌入空间对 80 个 prompt 模板取平均特征，额外提升 3.5%，合计 Prompt Engineering 贡献约 5% 的绝对性能提升。

## 实验结果

（1）**ImageNet 零样本准确率 76.2%，匹配全监督 ResNet-50**：CLIP ViT-L/14@336px 在未见任何 ImageNet 训练样本的情况下，达到 76.2% top-1 和 95% top-5 准确率，与 ResNet-50 的完全监督性能（76.2%）持平。这是对 Visual N-Grams（11.5%）的巨大飞跃，也是一个里程碑式的零样本结果。

（2）**27 个数据集综合评估**：零样本 CLIP 在 27 个数据集中 16 个上超越或持平完全监督的 ResNet-50 线性分类器。在通用知识任务（场景分类 SUN397、动作识别 UCF101）上表现突出，但在细粒度分类（区分汽车型号、花卉品种、飞机变体）上明显落后于监督方法。

（3）**消融实验揭示效率关键**：对比学习目标比预测文本词袋快 4 倍，比预测 Transformer 语言模型的完整文本快 12 倍。模型性能随计算量遵循可预测的幂律缩放（power-law scaling），表明持续加大规模是一条可靠路线。

（4）**不损害图像表征质量**：CLIP 特征的线性探测（linear probe）表现超越了当时最佳公开 ImageNet 模型（EfficientNet-L2 Noisy Student），同时计算效率更高，证明 CLIP 学到的视觉表征兼具泛化性和质量。

（5）**零样本 CLIP 比等精度监督模型更鲁棒**：在分布偏移测试中，零样本 CLIP 的鲁棒性显著优于同等 ImageNet 精度的监督模型——监督模型的精度越高，泛化性反而越差；而 CLIP 不存在这种"精度-鲁棒性"权衡，零样本评估更能反映模型的真实能力。

## 核心意义

CLIP 首次证明了 NLP 领域"任务无关的 Web 规模预训练"范式可以成功移植到计算机视觉领域，直接启发了 DALL·E、Stable Diffusion、BLIP、Flamingo、LLaVA 等后续工作。其双塔架构 + 对比学习的方案至今仍是多模态嵌入的基础架构。

关键洞察不在于架构创新，而在于三件事做对了：（1）用对比目标替代预测目标，获得了 4x 效率提升；（2）把数据规模拉满到 4 亿对，而非停留在之前 10 万对的量级；（3）提出了 Prompt Engineering 这一"零成本"性能提升手段。论文对方法的局限性有诚恳讨论——细粒度分类差、需要约 1000 倍计算才能追上全监督 SOTA、对抽象和系统性任务（如计数）基本失效——这种不回避边界的态度也是好研究的标志。
