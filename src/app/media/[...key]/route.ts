import { storage } from '../../../server/storage';

const TYPES: Record<string, string> = { webp: 'image/webp', gif: 'image/gif', mp4: 'video/mp4' };

// 本機儲存模式下提供 data/media 的圖片與影片（R2 模式直接走 R2 公開網址）
// 影片要支援 Range 請求，Safari 才播得動、也能拖曳進度條
export async function GET(req: Request, { params }: { params: { key: string[] } }) {
  const name = params.key.join('/');
  const ext = /^[a-z0-9-]+\.(webp|gif|mp4)$/.exec(name)?.[1];
  if (!ext) return new Response('Not found', { status: 404 });
  const buf = await storage.get(`media/${name}`);
  if (!buf) return new Response('Not found', { status: 404 });

  const headers: Record<string, string> = {
    'Content-Type': TYPES[ext],
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Accept-Ranges': 'bytes',
  };

  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('range') || '');
  if (range && (range[1] || range[2])) {
    const size = buf.length;
    let start = range[1] ? Number(range[1]) : size - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end) {
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    }
    return new Response(new Uint8Array(buf.subarray(start, end + 1)), {
      status: 206,
      headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1) },
    });
  }

  return new Response(new Uint8Array(buf), { headers: { ...headers, 'Content-Length': String(buf.length) } });
}
