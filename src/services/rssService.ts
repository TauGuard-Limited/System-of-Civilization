// RSS Feed Service — fetches and parses real RSS/Atom feeds via CORS proxy
// Uses browser's built-in DOMParser (no extra dependencies)

export interface RSSItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: number;
  author: string;
  categories: string[];
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
}

export interface RSSFeedConfig {
  id: string;
  name: string;
  url: string;
  category: 'news' | 'knowledge' | 'governance' | 'discourse';
  description: string;
  color: 'emerald' | 'cyan' | 'purple' | 'amber';
}

// CORS proxies (fallback chain)
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// Pre-configured real RSS feeds
export const REAL_FEEDS: RSSFeedConfig[] = [
  // News
  {
    id: 'bbc-world',
    name: 'BBC World News',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'news',
    description: 'Global news narratives from BBC World Service',
    color: 'emerald',
  },
  {
    id: 'npr-news',
    name: 'NPR News',
    url: 'https://feeds.npr.org/1001/rss.xml',
    category: 'news',
    description: 'US and international news from NPR',
    color: 'emerald',
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'news',
    description: 'International news perspective from Al Jazeera',
    color: 'emerald',
  },
  {
    id: 'reuters',
    name: 'Reuters World',
    url: 'https://www.reutersagency.eu/feed/',
    category: 'news',
    description: 'Global news from Reuters news agency',
    color: 'emerald',
  },
  // Knowledge
  {
    id: 'wikipedia-rc',
    name: 'Wikipedia Recent Changes',
    url: 'https://en.wikipedia.org/w/api.php?action=feedrecentchanges&feedformat=rss&limit=50',
    category: 'knowledge',
    description: 'Live edits to Wikipedia articles — how public knowledge evolves',
    color: 'cyan',
  },
  // Governance / Tech Discourse
  {
    id: 'eth-magicians',
    name: 'Ethereum Magicians',
    url: 'https://ethereum-magicians.org/posts.rss',
    category: 'governance',
    description: 'Ethereum protocol governance discussions and EIP proposals',
    color: 'purple',
  },
  {
    id: 'hackernews',
    name: 'Hacker News',
    url: 'https://hnrss.org/frontpage',
    category: 'discourse',
    description: 'Technology and public discourse from Hacker News front page',
    color: 'amber',
  },
  {
    id: 'guardian',
    name: 'The Guardian World',
    url: 'https://www.theguardian.com/world/rss',
    category: 'news',
    description: 'World news from The Guardian',
    color: 'emerald',
  },
];

// Fetch RSS feed via CORS proxy with fallback
export async function fetchRSSFeed(feedUrl: string): Promise<string> {
  let lastError: Error | null = null;

  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxyUrl = proxyFn(feedUrl);
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/rss+xml, application/xml, text/xml, */*' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      
      // Basic validation — should contain XML
      if (!text.includes('<') || (!text.includes('<rss') && !text.includes('<feed') && !text.includes('<channel') && !text.includes('<item'))) {
        throw new Error('Response does not appear to be valid RSS/Atom XML');
      }

      return text;
    } catch (err) {
      lastError = err as Error;
      continue; // Try next proxy
    }
  }

  throw lastError || new Error('All CORS proxies failed');
}

// Parse RSS/Atom XML into normalized items
export function parseRSS(xml: string, feedConfig: RSSFeedConfig): RSSItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(`XML parse error: ${parseError.textContent}`);
  }

  const items: RSSItem[] = [];

  // Try RSS 2.0 format first (<item> elements)
  const rssItems = doc.querySelectorAll('item');
  if (rssItems.length > 0) {
    rssItems.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent?.trim() || '';
      const link = item.querySelector('link')?.textContent?.trim() || '';
      const description = item.querySelector('description')?.textContent?.trim() || '';
      const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
      const author = item.querySelector('author, dc\\:creator')?.textContent?.trim() || '';
      const guid = item.querySelector('guid')?.textContent?.trim() || `${feedConfig.id}-${index}`;
      
      const categories: string[] = [];
      item.querySelectorAll('category').forEach(cat => {
        const text = cat.textContent?.trim();
        if (text) categories.push(text);
      });

      // Strip HTML from description
      const cleanDescription = stripHtml(description);

      items.push({
        id: guid,
        title,
        link,
        description: cleanDescription,
        pubDate: pubDate ? new Date(pubDate).getTime() : Date.now(),
        author,
        categories,
        sourceId: feedConfig.id,
        sourceName: feedConfig.name,
        sourceUrl: feedConfig.url,
      });
    });
  } else {
    // Try Atom format (<entry> elements)
    const atomEntries = doc.querySelectorAll('entry');
    atomEntries.forEach((entry, index) => {
      const title = entry.querySelector('title')?.textContent?.trim() || '';
      const linkEl = entry.querySelector('link[href]');
      const link = linkEl?.getAttribute('href') || '';
      const summary = entry.querySelector('summary, content')?.textContent?.trim() || '';
      const published = entry.querySelector('published, updated')?.textContent?.trim() || '';
      const author = entry.querySelector('author name')?.textContent?.trim() || '';
      const id = entry.querySelector('id')?.textContent?.trim() || `${feedConfig.id}-atom-${index}`;

      const categories: string[] = [];
      entry.querySelectorAll('category').forEach(cat => {
        const term = cat.getAttribute('term');
        if (term) categories.push(term);
      });

      items.push({
        id,
        title,
        link,
        description: stripHtml(summary),
        pubDate: published ? new Date(published).getTime() : Date.now(),
        author,
        categories,
        sourceId: feedConfig.id,
        sourceName: feedConfig.name,
        sourceUrl: feedConfig.url,
      });
    });
  }

  return items;
}

// Strip HTML tags from text
function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// Fetch and parse a feed in one call
export async function fetchAndParseFeed(feedConfig: RSSFeedConfig): Promise<RSSItem[]> {
  const xml = await fetchRSSFeed(feedConfig.url);
  return parseRSS(xml, feedConfig);
}

// Fetch multiple feeds in parallel
export async function fetchMultipleFeeds(
  feedConfigs: RSSFeedConfig[]
): Promise<{ feedId: string; items: RSSItem[]; error?: string }[]> {
  const results = await Promise.allSettled(
    feedConfigs.map(async (config) => {
      const items = await fetchAndParseFeed(config);
      return { feedId: config.id, items, config };
    })
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return { feedId: feedConfigs[i].id, items: result.value.items };
    } else {
      return { feedId: feedConfigs[i].id, items: [], error: result.reason?.message || 'Unknown error' };
    }
  });
}
