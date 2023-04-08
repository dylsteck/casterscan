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

      <footer className="
        flex flex-row
        justify-center
        gap-1 my-4
      ">
          Made by
          <a href="/users/yashkarthik" className="
            text-purple-900
            underline decoration-1
            decoration-transparent
            hover:decoration-purple-900
            decoration-wavy
            transition-colors ease-in-out duration-200
          ">Yash Karthik</a>
          and
          <a href="/users/dylsteck" className="
            text-purple-900
            underline decoration-1
            decoration-transparent
            hover:decoration-purple-900
            decoration-wavy
            transition-colors ease-in-out duration-200
          ">Dylan Steck</a>

      </footer>
    </>
  );
};

export default Home;
