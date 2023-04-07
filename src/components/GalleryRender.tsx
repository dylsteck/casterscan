import React, { useState } from 'react';
//import { getRelativeTime } from '../lib/time';
import Image from 'next/image';
import Link from 'next/link';
import type { Database } from '~/types/database.t';
import { getRelativeTime } from '~/lib/time';

type GalleryRenderProps = {
    cast?: Database['public']['Tables']['casts']['Row'];
    profile?: Database['public']['Tables']['profile']['Row'];
    index: number;
  };
  
export default function GalleryRender({ cast, profile, index }: GalleryRenderProps) {
    
    interface ExpandableImageProps {
        imageUrl: string;
      }    
  
      const ExpandableImage = ({ imageUrl }: ExpandableImageProps) => {
        const [isExpanded, setIsExpanded] = useState(false);
      
        return (
          <div className="relative mb-[5vh]">
            <div
              className="h-full object-contain cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Image
                src={`${imageUrl}.png`}
                alt="imgur image"
                width={400}
                height={400}
                className="w-auto h-auto max-h-[50vh] pt-2.5"
              />
            </div>
            {isExpanded && (
              <div
                className="fixed top-0 left-0 w-full h-full p-10 bg-black bg-opacity-50 flex justify-center items-center z-50"
                onClick={() => setIsExpanded(false)}
              >
                <Image src={`${imageUrl}.png`} alt="imgur image" width={700} height={700} className="max-w-full max-h-full" />
              </div>
            )}
          </div>
        );
      };      
    
      const renderCastText = (text: string, hash: string) => {
        const imgurRegex = /(https?:\/\/)?(www\.)?(i\.)?imgur\.com\/[a-zA-Z0-9]+(\.(jpg|jpeg|png|gif|bmp))?/g;
        const urlRegex = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
      
        const imgurMatches = text.match(imgurRegex);
        if (imgurMatches) {
          const textWithoutImgur = text.replace(imgurRegex, '').trim();
          return (
            <>
              <div>
                <Link href={`/casts/${hash}`}>
                  <p>{textWithoutImgur}</p>
                </Link>
              </div>
              {imgurMatches.map((match, index) => (
                <div key={index} className="mt-4 mb-4 flex justify-center">
                  <ExpandableImage imageUrl={match} />
                </div>
              ))}
            </>
          );
        }
        else{
          return (
            <>
              <div>
                <Link href={`/casts/${hash}`}>
                  <p>{text}</p>
                </Link>
              </div>
            </>
          );
        }
      
        const tokens = text.split(urlRegex);
        return (
          <p>
            {tokens.map((token, index) => {
              if (urlRegex.test(token)) {
                const url = token.startsWith('http') ? token : `http://${token}`;
                return (
                  <Link key={index} href={url}>
                    {token}
                  </Link>
                );
              }
              return token;
            })}
          </p>
        );
      };

      function stringify(value: unknown): string {
        return value === null || value === undefined ? '' : String(value);
      }
    
      return (
        <div
            key={`${typeof profile === 'undefined' ? `cast-${stringify(cast?.hash)}-${stringify(index)}` : `profile-${stringify(profile?.username)}-${stringify(index)}`}`}
            className={`w-full md:w-1/2 lg:w-1/3 hover:bg-purple-600 transition-colors duration-500`}>
            <div
                className={`border-t-2 border-purple-800 ${index === 0 ? 'pt-1' : ''} p-2 border-l-2 border-purple-800 md:border-l-0 h-full`}
                style={{ borderLeft: '2px solid #6b21a8' }}>
                <div
                    className="flex flex-row p-2 w-full ml-auto">
                    <Image
                        src={cast?.author_pfp_url ?? profile?.avatar_url ?? ''}
                        alt={`@${cast?.author_username ?? profile?.username ?? 'unknown'}'s PFP`}
                        width={20} height={20}
                        className="rounded-full w-6 h-6" />
                    <Link href={`/users/${cast?.author_username || profile?.username || ''}`}>
                        <p className="ml-3">@{cast?.author_username ?? profile?.username}</p>
                    </Link>

                    <div className="relative ml-auto group text-sm text-gray-300">
                      <p className='block group-hover:hidden'>{getRelativeTime(new Date(cast?.published_at || new Date()))}</p>
                      <p className="hidden group-hover:block">
                        {
                          (new Date(cast?.published_at || new Date()))
                            .toUTCString()
                            .slice(4, 16)
                        }
                      </p>
                    </div>
                </div>
                <div className="p-3 break-words justify-center">{renderCastText(cast?.text ?? '', cast?.hash ?? '')}</div>
            </div>
        </div>
    )  
}
