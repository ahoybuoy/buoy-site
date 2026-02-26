const DS_SOURCE_URL =
  'https://raw.githubusercontent.com/ahoybuoy/buoy-site/main/src/pages/ds.astro'

export function GET() {
  return Response.redirect(DS_SOURCE_URL, 302)
}
