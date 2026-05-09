---
title: "Attention Is All You Need"
date: 2026-04-27
arxiv: "1706.03762"
venue: NeurIPS 2017
authors: ["Vaswani et al.", "Google Brain"]
tags: ["Transformer", "Attention", "NLP", "NeurIPS2017"]
rating: 5
tldr: "提出纯注意力机制的 Transformer 架构，完全抛弃循环和卷积，在机器翻译任务上取得 SOTA，开创了现代深度学习的新时代。"
---

## 核心问题

在 Transformer 提出之前，序列建模主要依赖 RNN（LSTM/GRU），存在两个根本性缺陷：

1. **顺序计算**：无法并行化，训练效率低
2. **长程依赖**：随序列长度增加，梯度消失问题严重

## 方法

### 多头自注意力（Multi-Head Self-Attention）

注意力函数本质是将 Query 对一组 Key-Value 对做加权求和：

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

缩放因子 $\sqrt{d_k}$ 的作用：防止点积结果过大导致 softmax 梯度消失。

多头注意力将 $d_{model}$ 维向量投影到 $h$ 个不同子空间分别计算注意力，再拼接：

$$
\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, ..., \text{head}_h) W^O
$$

### Encoder-Decoder 架构

```
Input → [Embedding + Positional Encoding]
      → Encoder (6层 × Self-Attention + FFN)
      → Decoder (6层 × Self-Attention + Cross-Attention + FFN)
      → Linear + Softmax → Output
```

### 位置编码（Positional Encoding）

由于注意力机制本身对序列顺序无感，使用正弦/余弦函数注入位置信息：

$$
PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right)
$$

## 实验结果

| 模型 | EN-DE BLEU | EN-FR BLEU | 训练时间 |
|------|-----------|-----------|---------|
| 之前 SOTA (ConvS2S) | 25.16 | 40.46 | - |
| **Transformer (base)** | **27.3** | **38.1** | 12h |
| **Transformer (big)** | **28.4** | **41.0** | 3.5天 |

在 WMT 2014 英德翻译上超越之前所有模型，且训练成本显著降低。

## 个人感想

这篇论文的意义远超机器翻译本身。它证明了**注意力机制可以独立承担序列建模任务**，无需任何循环或卷积结构。

几年后，这个架构催生了 BERT、GPT 系列、ViT 等一系列革命性工作，几乎重塑了整个 AI 领域。回头看，"Attention Is All You Need" 这个标题真的没有夸张。

**最值得学习的地方**：
- 设计简洁而优雅，可并行化是 Transformer 成功的关键工程因素
- 多头注意力让模型能同时关注不同子空间的信息，是非常直觉的设计
- 位置编码的设计展示了如何将归纳偏置引入无结构模型

## 相关论文

- BERT (Devlin et al., 2018) - 双向预训练
- GPT (Radford et al., 2018) - 自回归预训练
- Vision Transformer / ViT (Dosovitskiy et al., 2020) - 图像版本
