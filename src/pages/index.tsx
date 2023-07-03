import { type NextPage } from "next";
import Head from "next/head";
import Header from "~/components/Header";
import LiveFeed from "~/components/LiveFeed";

const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>Casterscan</title>
        <meta name="description" content="A block explorer for the Farcaster network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LiveFeed />
    </>
  );
};

export default Home;
