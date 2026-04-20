import { ICON_IMG_URL, SEO } from "@/app/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/.well-known/farcaster.json")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const baseUrl = `${url.protocol}//${url.host}`;
        const config = {
          accountAssociation: {
            header:
              "eyJmaWQiOjYxNiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDVFNzlGNjkwY2NENDIwMDdENUEwYUQ2NzhDRDQ3NDc0MzM5NDAwRTMifQ",
            payload: "eyJkb21haW4iOiJjYXN0ZXJzY2FuLmNvbSJ9",
            signature:
              "MHg3MWVhZTMwNTFjNGE4ODc4OGIwN2FiMmMxNDg0MWU5ZGM2YTkwNWMwYTJjZGE1NDlkMGUxOGFmNjc3MjljNTUyNDJmMTY1NjQyMGU4NWM2YzBjZWVhZmJlMjE0NzRlN2MyNmZiNTA5Y2IzYjdkOTllNzUwYzU4MWI3OTQwMDQxNzFj",
          },
          frame: {
            version: "1",
            name: SEO.title,
            homeUrl: baseUrl,
            iconUrl: ICON_IMG_URL,
            splashImageUrl: ICON_IMG_URL,
            splashBackgroundColor: "#FFFFFF",
            subtitle: SEO.description,
            description: SEO.description,
            primaryCategory: "social",
            tags: ["developer", "explorer", "snapchain", "casterscan", "dylsteck"],
            castShareUrl: `${baseUrl}/share-cast`,
            heroImageUrl: SEO.ogImage,
            tagline: SEO.description,
            ogTitle: SEO.title,
            ogDescription: SEO.description,
            ogImageUrl: SEO.ogImage,
            noindex: false,
          },
          baseBuilder: {
            allowedAddresses: ["0x8342A48694A74044116F330db5050a267b28dD85"],
          },
        };

        return Response.json(config);
      },
    },
  },
});
