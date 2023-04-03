import { type NextPage } from "next";
import { useRouter } from 'next/router'
import Head from "next/head";
import Gallery from '../components/Gallery';

const Search: NextPage = () => {
    const router = useRouter()
    const { q } = router.query

  return (
    <>
      <Head>
        <title>Casterscan</title>
        <meta name="description" content="A block explorer for the Farcaster network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Gallery user={''} query={q} />
    </>
  );
};

export default Search;
