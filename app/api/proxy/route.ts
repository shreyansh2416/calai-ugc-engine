export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new Response('No image URL provided', { status: 400 });
  }

  try {
    // The Vercel server fetches the GIF, completely bypassing the user's browser adblocker
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const blob = await response.blob();
    
    // Return the GIF to the frontend as a first-party asset
    return new Response(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/gif',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    console.error("Proxy Error:", error);
    return new Response('Error proxying image', { status: 500 });
  }
}