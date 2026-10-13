export interface DocHeading {
  line: number;
  level: number;
  text: string;
  /** Prototype hash from the module's「对应页面：#/...」line */
  route?: string;
}

const HEADING_PATTERN = /^(#{1,4})\s+(.+?)\s*#*\s*$/;
const ROUTE_PATTERN = /^\s*(?:[-*]\s*)?(?:\*\*)?对应页面(?:\*\*)?\s*[:：]\s*`?(#\/?[^\s`]*)`?/;

export function extractDocHeadings(markdown: string): DocHeading[] {
  const headings: DocHeading[] = [];
  let inFence = false;
  markdown.split(/\r?\n/).forEach((text, index) => {
    if (/^\s*(```|~~~)/.test(text)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const heading = HEADING_PATTERN.exec(text);
    if (heading) {
      headings.push({ line: index + 1, level: heading[1].length, text: heading[2].replace(/[*_`]/g, '') });
      return;
    }
    const route = ROUTE_PATTERN.exec(text);
    const current = headings[headings.length - 1];
    if (route && current && !current.route) {
      current.route = route[1];
    }
  });
  return headings;
}

function parseHash(hash: string) {
  const [path = '', query = ''] = hash.replace(/^#\/?/, '').split('?');
  return { path: path.replace(/\/+$/, ''), params: new URLSearchParams(query) };
}

/** Line of the module whose route best matches the prototype hash (longest path, then most params) */
export function findActiveModuleLine(headings: DocHeading[], frameHash: string): number | null {
  const frame = parseHash(frameHash);
  let best: { line: number; score: number } | null = null;
  for (const heading of headings) {
    if (!heading.route) continue;
    const route = parseHash(heading.route);
    const pathMatches = frame.path === route.path || (route.path !== '' && frame.path.startsWith(`${route.path}/`));
    if (!pathMatches) continue;
    const routeParams = [...route.params.entries()];
    if (!routeParams.every(([key, value]) => frame.params.get(key) === value)) continue;
    const score = route.path.length * 100 + routeParams.length;
    if (!best || score > best.score) {
      best = { line: heading.line, score };
    }
  }
  return best?.line ?? null;
}
