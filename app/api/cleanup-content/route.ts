import { NextResponse } from 'next/server';
import matter from 'gray-matter';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch {
  redis = null;
}

function yamlValue(value: string): string {
  if (/[:#{}[\],&*!?|>'"@%-]/.test(value) || value.trim() !== value) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

function extractContentAfterFrontmatter(raw: string): string {
  // Find content after the first frontmatter block (--- ... ---)
  const match = raw.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)$/);
  return match ? match[1].trim() : raw.trim();
}

export async function GET() {
  if (!redis) {
    return NextResponse.json({ error: 'Redis not available' }, { status: 500 });
  }

  const results: string[] = [];
  const categories = ['report', 'brief', 'update'];
  const langs = ['en', 'ja', 'es'];

  for (const category of categories) {
    for (const lang of langs) {
      const key = `content:${category}:${lang}`;
      try {
        const data = await redis.hgetall<Record<string, string>>(key);
        if (!data || Object.keys(data).length === 0) continue;

        for (const [slug, rawMarkdown] of Object.entries(data)) {
          if (!rawMarkdown) continue;

          // Extract the content part after the first frontmatter block
          const contentPart = extractContentAfterFrontmatter(rawMarkdown);

          // Check if the content part itself starts with frontmatter (double frontmatter)
          const hasNestedFrontmatter = contentPart.trim().startsWith('---');

          // Also try parsing to get metadata for rebuild
          let parsed;
          try {
            parsed = matter(rawMarkdown);
          } catch {
            // If parsing fails, just extract manually
            parsed = { data: {}, content: contentPart };
          }

          // Get clean content: if nested frontmatter exists, strip it
          let cleanContent = parsed.content;
          if (hasNestedFrontmatter) {
            try {
              const inner = matter(contentPart);
              if (inner.content && inner.content.trim()) {
                cleanContent = inner.content;
              }
            } catch {
              // If inner parsing fails, just use contentPart as-is
              cleanContent = contentPart;
            }
          }

          cleanContent = cleanContent.trim();

          // Rebuild frontmatter with quoted values
          const data = parsed.data as Record<string, any>;
          const frontmatterLines: string[] = ['---'];
          if (data.title) frontmatterLines.push(`title: ${yamlValue(String(data.title))}`);
          if (data.date) frontmatterLines.push(`date: ${data.date}`);
          if (data.publishAt) frontmatterLines.push(`publishAt: ${data.publishAt}`);
          if (data.expireAt) frontmatterLines.push(`expireAt: ${data.expireAt}`);
          if (data.assignedUsers) {
            const users = Array.isArray(data.assignedUsers)
              ? data.assignedUsers
              : [data.assignedUsers];
            frontmatterLines.push(`assignedUsers: [${users.map((u: string) => `"${u}"`).join(', ')}]`);
          }
          if (data.isPublic !== undefined) frontmatterLines.push(`isPublic: ${data.isPublic}`);
          frontmatterLines.push('---');

          const cleanMarkdown = `${frontmatterLines.join('\n')}\n\n${cleanContent}\n`;

          // Only save if something changed
          if (cleanMarkdown !== rawMarkdown) {
            await redis.hset(key, { [slug]: cleanMarkdown });
            results.push(`Cleaned ${lang}/${category}/${slug}`);
          }
        }
      } catch (err: any) {
        results.push(`Error ${lang}/${category}: ${err.message}`);
      }
    }
  }

  return NextResponse.json({
    success: true,
    cleaned: results.length,
    items: results,
  });
}
