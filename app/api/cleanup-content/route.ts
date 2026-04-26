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

          // Parse the stored markdown
          const parsed = matter(rawMarkdown);

          // Check if the content part itself contains frontmatter (double frontmatter issue)
          const innerParsed = matter(parsed.content);
          const hasNestedFrontmatter = innerParsed.data && Object.keys(innerParsed.data).length > 0;

          if (hasNestedFrontmatter) {
            // Rebuild with clean content (strip the nested frontmatter)
            const cleanContent = innerParsed.content.trim();
            const frontmatterLines: string[] = ['---'];
            if (parsed.data.title) frontmatterLines.push(`title: ${parsed.data.title}`);
            if (parsed.data.date) frontmatterLines.push(`date: ${parsed.data.date}`);
            if (parsed.data.publishAt) frontmatterLines.push(`publishAt: ${parsed.data.publishAt}`);
            if (parsed.data.expireAt) frontmatterLines.push(`expireAt: ${parsed.data.expireAt}`);
            if (parsed.data.assignedUsers) frontmatterLines.push(`assignedUsers: [${parsed.data.assignedUsers.map((u: string) => `"${u}"`).join(', ')}]`);
            if (parsed.data.isPublic !== undefined) frontmatterLines.push(`isPublic: ${parsed.data.isPublic}`);
            frontmatterLines.push('---');

            const cleanMarkdown = `${frontmatterLines.join('\n')}\n\n${cleanContent}\n`;
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
