import { type AppType } from "next/app";
import { GoogleAnalytics } from "nextjs-google-analytics";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Layout from "~/components/Layout";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className="">
      <Layout>
        <GoogleAnalytics trackPageViews/>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
};

export default api.withTRPC(MyApp);
