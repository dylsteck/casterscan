import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Layout from "~/components/Layout";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className="">
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
};

export default api.withTRPC(MyApp);
