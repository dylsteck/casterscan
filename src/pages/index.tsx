import { type NextPage } from "next";
import { useRouter } from 'next/router'
import Head from "next/head";
import Gallery from '../components/Gallery';
import { useEffect } from "react";

const Home: NextPage = () => {
  const router = useRouter()
  const { q } = router.query

  useEffect(() => {
    console.log("New q: ", q);
  }, [q])

  return (
    <>
      <Head>
        <title>Casterscan</title>
        <meta name="description" content="A block explorer for the Farcaster network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Gallery user={''} />
    </>
  );
};

export default Home;
