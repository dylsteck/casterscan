import React, { useState } from 'react';
import triggerSearch from '../lib/triggerSearch'
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import logo from '../assets/img/casterscanIcon.png'

const Header: React.FC = () => {

  const [input, setInput] = useState('')
  const router = useRouter()
//mb-[5vh]
  return (
    <nav className="bg-transparent border-gray-200 sticky top-3">
      <div className="container flex flex-wrap items-center justify-between mx-auto">
        <Link href="/" className="flex items-center">
            <Image className="inline-block" src={logo} width={35} height={35} alt="Casterscan logo"/>
            <span className="self-center text-3xl font-semibold whitespace-nowrap dark:text-white ml-5">Casterscan</span>
        </Link>
        <div className="flex">
          <label className="relative text-gray-400 block">
            <input 
              type="text" 
              placeholder="Search by cast hash/ENS/address" 
              value={input}
              className="min-w-[30vw] form-input rounded-lg py-3 px-4 bg-white placeholder-gray-400 text-gray-500 appearance-none w-full block pl-5 focus:outline-none"
              onChange={(e) => setInput(e.target.value)}/> 
            <div 
              className="bg-[#6F5B9C] rounded-md p-1.5 pointer-events-none w-8 h-8 absolute top-1/2 transform -translate-y-1/2 right-3"
              onClick={() => triggerSearch(input, router)}>
              <MagnifyingGlassIcon className="w-full h-full text-white" />
            </div>
          </label>
          </div>
      </div>
      <hr className="relative left-0 w-[100vw] mt-[2vh]"/>
    </nav>
  );
};

export default Header;