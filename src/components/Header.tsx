import React, { useEffect, useState } from 'react';
import { api } from '~/utils/api';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import logo from '../../public/casterScanIcon.png'

const Header: React.FC = () => {

  const [input, setInput] = useState('');
  const [searching, setSearching] = useState(false);
  const router = useRouter();
  const fetchUser = api.user.getUserPageData.useQuery({ username: input}, { retry: false });
  const fetchCast = api.casts.getCastByHash.useQuery({ hash: input }, { retry: false });
  const { q } = router.query;

  useEffect(() => {
    if (typeof q === 'undefined') {
      setInput('');
    }
  }, [q]);

  const search = async () => {
    const usernameRegex = /^[a-z0-9][a-z0-9-]{0,15}$/;
    const isSearchTermUsername = usernameRegex.test(input);

    if (isSearchTermUsername) {
      const usernameFetch = await fetchUser.refetch();

      if (usernameFetch.error?.message == "PGRST116") {
        console.log("PGRST116 yes");
        // early return as query matches username regex, but username not found => query is a text-query
        await router.push(`/?q=${input}`);
        return;
      }

      // query matches username regex and does not throw => userame exists;
      await router.push(`/users/${usernameFetch.data?.user?.username ?? ''}`);
      return;
    }

    // if the search term was a username, function wouldve already exited. 
    const castFetch = await fetchCast.refetch();
    if (castFetch.data) {
      await router.push(`/casts/${castFetch.data.cast?.hash ?? ''}`);
      return;
    }


    // If input not cast or user, push as search query
    await router.push(`/?q=${input ?? ''}`);
    return;
  };  

  const searchAsync = async (): Promise<void> => {
    try {
      await search();
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  };
  

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setSearching(true);
    searchAsync()
      .catch((error) => console.error(error))
      .finally(() => setSearching(false));
  };
  
  return (
    <nav className="bg-transparent border-purple-800 sticky top-3">
      <div className="container flex flex-wrap items-center justify-between mx-auto px-4 sm:px-0">
        <Link href="/" className="flex items-center">
            <Image className="inline-block pl-0" src={logo} width={35} height={35} alt="Casterscan logo"/>
            <span className="self-center text-3xl font-semibold whitespace-nowrap dark:text-white ml-5 hidden md:block">Casterscan</span>
        </Link>
        <div className="flex">

        <form className="relative text-gray-400 block" onSubmit={(e) => handleFormSubmit(e)}>

            <input 
              type="text" 
              placeholder="Search by hash or username" 
              value={input}
              className="min-w-[30vw] form-input rounded-lg py-3 px-4 bg-white placeholder-gray-400 text-gray-500 appearance-none w-full block pl-5 focus:outline-none sm:min-w-[50vw]"
              onChange={(e) => setInput(e.target.value)}
            />

            <button type="submit" className="
              bg-[#6F5B9C]
              rounded-md
              p-1.5 w-8 h-8
              absolute top-1/2 right-3
              transform -translate-y-1/2 
            ">
              { searching ?
                <ArrowPathIcon className="animate-spin w-full h-full text-white" />
                : <MagnifyingGlassIcon className=" w-full h-full text-white" />
              }
            </button>
          </form>

          </div>
      </div>
      <hr className="relative left-0 w-[100vw] mt-[2vh]"/>
    </nav>
  );
};

export default Header;
