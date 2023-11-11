import { type AppType } from "next/app";
import { GoogleAnalytics } from "nextjs-google-analytics";

import "~/styles/globals.css";
import Layout from "~/components/Layout";
import { SearchContextProvider } from "~/context/SearchContext";
import { FarcasterKitProvider } from "farcasterkit";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className="">
      <FarcasterKitProvider>
        <SearchContextProvider>
          <Layout>
            <GoogleAnalytics trackPageViews/>
            <Component {...pageProps} />
          </Layout>
        </SearchContextProvider>
      </FarcasterKitProvider>
    </div>
  );
};

export default MyApp;
