import rss from '@astrojs/rss';
import { SITE } from '../site';
import { getVisiblePosts, postPath } from '../utils/posts';

export async function GET(context) {
  const posts = await getVisiblePosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postPath(post),
      categories: post.data.tags,
    })),
  });
}
