import React, { useEffect, useState } from 'react';
import { api } from '~/utils/api';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import logo from '../../public/casterScanIcon.png'
import { TRPCError } from '@trpc/server';

const Header: React.FC = () => {

  const [input, setInput] = useState('');
  const [searching, setSearching] = useState(false);
  const router = useRouter();
  const t = api.useContext();
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
      const searchUser = await t.user.getUserPageData.fetch({ username: input });
      // Note: added logic to replace user with TRPCError if error exists
      // In future can change so there's a separate property called error
      if (!(searchUser.user instanceof TRPCError)) {
        await router.push(`/users/${searchUser.user.username}/`);
        return;
      };
    } else {
      const searchCast = await t.casts.getCastByHash.fetch({ hash: input });
      if (searchCast) {
        await router.push(`/casts/${searchCast.cast?.hash}`);
        return;
      }
    }
    // If input not cast or user, push as search query
    await router.push(`/?q=${input}`);
  };  
  
  
  return (
    <nav className="bg-transparent border-purple-800 sticky top-3">
      <div className="container flex flex-wrap items-center justify-between mx-auto px-4 sm:px-0">
        <Link href="/" className="flex items-center">
            <Image className="inline-block pl-0" src={logo} width={35} height={35} alt="Casterscan logo"/>
            <span className="self-center text-3xl font-semibold whitespace-nowrap dark:text-white ml-5 hidden md:block">Casterscan</span>
        </Link>
        <div className="flex">

          <form className="relative text-gray-400 block"
            onSubmit={async e => {
              e.preventDefault();
              setSearching(true);
              await search();
              setSearching(false);
          }}>
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
