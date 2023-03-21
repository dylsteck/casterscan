import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Filters from '../components/Filters';
import Gallery from '../components/Gallery';

const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>Casterscan</title>
        <meta name="description" content="A block explorer for the Farcaster network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Filters />
        <Gallery />
      </main>
    </>
  );
};

export default Home;
