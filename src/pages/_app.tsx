import { type AppType } from "next/app";
import { GoogleAnalytics } from "nextjs-google-analytics";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Layout from "~/components/Layout";
import { SearchContextProvider } from "~/context/SearchContext";
import { FarcasterKitProvider } from "~/providers/FarcasterKitProvider";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className="">
      <FarcasterKitProvider baseURL="http://localhost:3001">
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

export default api.withTRPC(MyApp);
