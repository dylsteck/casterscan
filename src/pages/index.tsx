import { type NextPage } from "next";
import Head from "next/head";
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
      { searchValue.length > 0 ? <Search /> : <LiveFeed /> }
    </>
  );
};

export default Home;
