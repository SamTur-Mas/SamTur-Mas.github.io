import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const papers = await getCollection('papers', ({ data }) => !data.draft);
  const sorted = papers.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'PaperLog - 论文笔记',
    description: '记录每日论文阅读、分析与感想',
    site: context.site!,
    items: sorted.map(paper => ({
      title: paper.data.title,
      pubDate: paper.data.date,
      description: paper.data.tldr ?? '',
      link: `/papers/${paper.id}/`,
    })),
    customData: '<language>zh-CN</language>',
  });
}
