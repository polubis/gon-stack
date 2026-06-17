export async function GET() {
  return Response.json({
    ok: true,
    runtime: 'Cloudflare Workers',
    time: new Date().toISOString(),
  });
}
