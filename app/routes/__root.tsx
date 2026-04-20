import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import Header from "@/app/components/custom/header";
import MiniAppProvider from "@/app/components/custom/mini-app-provider";
import Providers from "@/app/providers";
import { BANNER_IMG_URL, BASE_URL, ICON_IMG_URL, frame } from "@/app/lib/utils";
import appCss from "@/app/globals.css?url";

const PAGE = {
  title: "Casterscan",
  description: "A block explorer for Farcaster",
  url: BASE_URL,
};

const googleAnalyticsId =
  (typeof process !== "undefined" ? process.env.GOOGLE_ANALYTICS_ID : undefined) ??
  import.meta.env.VITE_GOOGLE_ANALYTICS_ID ??
  "";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: PAGE.title },
      { name: "description", content: PAGE.description },
      { property: "og:title", content: PAGE.title },
      { property: "og:description", content: PAGE.description },
      { property: "og:url", content: PAGE.url },
      { property: "og:site_name", content: PAGE.title },
      { property: "og:image", content: BANNER_IMG_URL },
      { property: "og:locale", content: "en_US" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PAGE.title },
      { name: "twitter:description", content: PAGE.description },
      { name: "twitter:creator", content: "@Dylan_Steck" },
      { name: "twitter:image", content: BANNER_IMG_URL },
      { name: "fc:frame", content: JSON.stringify(frame()) },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: ICON_IMG_URL },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {googleAnalyticsId ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleAnalyticsId}');`,
              }}
            />
          </>
        ) : null}
      </head>
      <body className="font-sans">
        <Providers>
          <MiniAppProvider>
            <div className="min-h-screen">
              <Header />
              <Outlet />
            </div>
          </MiniAppProvider>
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
