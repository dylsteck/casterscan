import { type AppType } from "next/app";
import { GoogleAnalytics } from "nextjs-google-analytics";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Layout from "~/components/Layout";
import { SearchContextProvider } from "~/context/SearchContext";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className="">
      <SearchContextProvider>
        <Layout>
          <GoogleAnalytics trackPageViews/>
          <Component {...pageProps} />
        </Layout>
      </SearchContextProvider>
    </div>
  );
};

export default api.withTRPC(MyApp);
