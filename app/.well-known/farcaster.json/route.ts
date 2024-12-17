import { BASE_URL, ICON_IMG_URL } from "../../lib/utils";

export async function GET() {
  const config = {
    "accountAssociation": {
        "header": "eyJmaWQiOjYxNiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDVFNzlGNjkwY2NENDIwMDdENUEwYUQ2NzhDRDQ3NDc0MzM5NDAwRTMifQ",
        "payload": "eyJkb21haW4iOiJjYXN0ZXJzY2FuLmNvbSJ9",
        "signature": "MHg3MWVhZTMwNTFjNGE4ODc4OGIwN2FiMmMxNDg0MWU5ZGM2YTkwNWMwYTJjZGE1NDlkMGUxOGFmNjc3MjljNTUyNDJmMTY1NjQyMGU4NWM2YzBjZWVhZmJlMjE0NzRlN2MyNmZiNTA5Y2IzYjdkOTllNzUwYzU4MWI3OTQwMDQxNzFj"
    },
    frame: {
      version: "0.0.1",
      name: "Casterscan",
      iconUrl: ICON_IMG_URL,
      splashImageUrl: ICON_IMG_URL,
      splashBackgroundColor: "#FFFFFF",
      homeUrl: BASE_URL,
    },
  };

  return Response.json(config);
}