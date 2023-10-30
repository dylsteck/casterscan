import { type NextPage } from "next";
import Head from "next/head";
import Script from "next/script";
import { useContext } from "react";
import LiveFeed from "~/components/LiveFeed";
import Search from "~/components/Search";
import { SearchContext } from "~/context/SearchContext";

const Home: NextPage = () => {

  const { searchValue } = useContext(SearchContext);

  return (
    <>
      <Head>
        <title>Casterscan</title>
        <meta name="description" content="A block explorer for Farcaster" />
        {/* these theme-color and apple-mobile-web meta tags set the theme and navbar colors for the pwa */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-B02X48B2NQ" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-B02X48B2NQ');
        `}
      </Script>  {/* TODO: see if can remove the other Google analytics package now */}
      { searchValue.length > 0 ? <Search /> : <LiveFeed /> }
    </>
  );
};

export default Home;