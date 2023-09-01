import { type NextPage } from "next";
import Head from "next/head";
import Script from "next/script";
import { useContext } from "react";
import Header from "~/components/Header";
import LiveFeed from "~/components/LiveFeed";
import Search from "~/components/Search";
import { SearchContext } from "~/context/SearchContext";

const Home: NextPage = () => {

  const { searchValue } = useContext(SearchContext);

  return (
    <>
      <Head>
        <title>Casterscan</title>
        <meta name="description" content="A block explorer for the Farcaster network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-1G0WTCHYKQ" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-1G0WTCHYKQ');
        `}
      </Script>  {/* TODO: see if can remove the other Google analytics package now */}
      { searchValue.length > 0 ? <Search /> : <LiveFeed /> }
    </>
  );
};

export default Home;