import React, { useState } from 'react';
import { api } from '~/utils/api';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import logo from '../../public/casterScanIcon.png'

const Header: React.FC = () => {

  const [input, setInput] = useState('')
  const router = useRouter();
  const [user, cast] = api.useQueries((t) => [
    t.user.getUserPageData({username: input as string}, {enabled: false}),
    t.casts.getCastByHash({hash: input as string}, {refetchOnWindowFocus: false, enabled: false})
  ]);

  const search = async () => {
    const [refetchedUser, refetchedCast] = await Promise.all([
      user.refetch(),
      cast.refetch(),
    ]);

    const finalUser = refetchedUser.data
    const finalCast = refetchedCast.data
    if(typeof finalUser !== 'undefined'){
      await router.push(`/users/${finalUser?.user?.username}`)
    }
    else if(typeof finalCast !== 'undefined'){
      await router.push(`/casts/${finalCast?.cast?.hash}`)
    }
    else{
      await router.push(`/search?q=${input}`)
    }
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
            onSubmit={e => {
              e.preventDefault();
              search();
          }}>
            <input 
              type="text" 
              placeholder="Search by hash or username" 
              value={input}
              className="min-w-[30vw] form-input rounded-lg py-3 px-4 bg-white placeholder-gray-400 text-gray-500 appearance-none w-full block pl-5 focus:outline-none sm:min-w-[50vw]"
              onChange={(e) => setInput(e.target.value)}
            />

            <button className="
              bg-[#6F5B9C]
              rounded-md
              p-1.5 w-8 h-8
              absolute top-1/2 right-3
              transform -translate-y-1/2 
            ">
              <MagnifyingGlassIcon className="w-full h-full text-white" />
            </button>
          </form>

          </div>
      </div>
      <hr className="relative left-0 w-[100vw] mt-[2vh]"/>
    </nav>
  );
};

export default Header;
