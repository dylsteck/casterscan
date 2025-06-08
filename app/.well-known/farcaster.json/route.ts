import { BASE_URL, ICON_IMG_URL, SEO } from "../../lib/utils";

export async function GET() {
  const config = {
    "accountAssociation": {
        "header": "eyJmaWQiOjYxNiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDVFNzlGNjkwY2NENDIwMDdENUEwYUQ2NzhDRDQ3NDc0MzM5NDAwRTMifQ",
        "payload": "eyJkb21haW4iOiJjYXN0ZXJzY2FuLmNvbSJ9",
        "signature": "MHg3MWVhZTMwNTFjNGE4ODc4OGIwN2FiMmMxNDg0MWU5ZGM2YTkwNWMwYTJjZGE1NDlkMGUxOGFmNjc3MjljNTUyNDJmMTY1NjQyMGU4NWM2YzBjZWVhZmJlMjE0NzRlN2MyNmZiNTA5Y2IzYjdkOTllNzUwYzU4MWI3OTQwMDQxNzFj"
    },
    frame: {
      version: "1",
      name: SEO.title,
      homeUrl: BASE_URL,
      iconUrl: ICON_IMG_URL,
      splashImageUrl: ICON_IMG_URL,
      splashBackgroundColor: "#FFFFFF",
      subtitle: SEO.description,
      description: SEO.description,
      primaryCategory: "developer-tools",
      tags: ['developer', 'developer-tools', 'explorer', 'snapchain', 'casterscan'],
      castShareUrl: `${BASE_URL}/share-cast`,
      heroImageUrl: SEO.ogImage,
      tagline: SEO.description,
      ogTitle: SEO.title,
      ogDescription: SEO.description,
      ogImageUrl: SEO.ogImage,
      noindex: false,
    }
  };

  return Response.json(config);
}