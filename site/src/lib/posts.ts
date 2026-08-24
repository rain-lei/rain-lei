import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export const categoryLabels = { study: '学习', life: '生活', entertainment: '娱乐' } as const;
export const categoryWords = { study: 'LEARN', life: 'LIVE', entertainment: 'PLAY' } as const;
export const formatDate = (date: Date) => new Intl.DateTimeFormat('zh-CN', { year:'numeric', month:'2-digit', day:'2-digit' }).format(date).replaceAll('/', '.');
export const estimateRead = (body: string) => `${Math.max(1, Math.ceil(body.replace(/\s+/g, '').length / 500))} min read`;
export const sortPosts = (posts: Post[]) => posts.filter((post) => post.data.status === 'published').sort((a,b) => b.data.date.getTime() - a.data.date.getTime());
export const postSlug = (post: Post) => post.data.id || post.id.replace(/\.md$/i, '');
