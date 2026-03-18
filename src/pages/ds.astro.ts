const DS_SOURCE_URL =
  'https://raw.githubusercontent.com/ahoybuoy/buoy-site/main/src/pages/ds.astro'

export async function GET() {
  const response = await fetch(DS_SOURCE_URL)
  const content = await response.text()
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
