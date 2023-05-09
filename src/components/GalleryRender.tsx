import React, { useState } from 'react';
//import { getRelativeTime } from '../lib/time';
import Image from 'next/image';
import Link from 'next/link';
import type { KyselyDB } from '~/types/database.t';
import { getRelativeTime } from '~/lib/time';
import { useRouter } from 'next/router'
//import warpcastIcon from '../../public/warpcastIcon.png';
//import { ArrowPathRoundedSquareIcon, HandThumbUpIcon } from '@heroicons/react/24/solid';

type GalleryRenderProps = {
    cast?: KyselyDB['mergedCast'];
    profile?: KyselyDB['profile'];
    index: number;
  };
  
export default function GalleryRender({ cast, profile, index }: GalleryRenderProps) {

    const router = useRouter();
    
    interface ExpandableImageProps {
        imageUrl: string;
      }    
  
      // TODO: support svgs(eg. lot of avatar_urls are OpenSea SVGs)
      const ExpandableImage = ({ imageUrl }: ExpandableImageProps) => {
        const [isExpanded, setIsExpanded] = useState(false);
    
        const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
          event.stopPropagation();
          event.preventDefault();
          setIsExpanded(!isExpanded);
        };
    
        return (
          <div className="relative mb-[5vh]">
            <div className="h-full object-contain cursor-pointer" onClick={handleImageClick}>
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
                <Image src={`${imageUrl}.png`} alt="imgur image" width={700} height={700} className="max-h-[75vh] object-contain" />
              </div>
            )}
          </div>
        );
      };      
    
      const renderCastText = (text: string) => {
        const imgurRegex = /(https?:\/\/)?(www\.)?(i\.)?imgur\.com\/[a-zA-Z0-9]+(\.(jpg|jpeg|png|gif|bmp))?/g;
        const urlRegex = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
      
        const imgurMatches = text.match(imgurRegex);
        if (imgurMatches) {
          const textWithoutImgur = text.replace(imgurRegex, '').trim();
          return (
            <>
              <p>{textWithoutImgur}</p>
              {imgurMatches.map((match, index) => (
                <div key={index} className="mt-4 mb-4 flex justify-center">
                  <ExpandableImage imageUrl={match} />
                </div>
              ))}
            </>
          );
        }
      
        const tokens = [];
        let match;
        let lastIndex = 0;
        while ((match = urlRegex.exec(text)) !== null) {
          tokens.push(text.slice(lastIndex, match.index));
          tokens.push(match[0]);
          lastIndex = urlRegex.lastIndex;
        }
        tokens.push(text.slice(lastIndex));
      
        return (
          <p>
            {tokens.map((token, index) => {
              if (urlRegex.test(token)) {
                const url = token.startsWith('http') ? token : `https://${token}`;
                return (
                  <Link key={`${index}_1`} href={url}>
                    {url}
                  </Link>
                );
              } else {
                return token;
              }
            })}
          </p>
        );
      };          

      function stringify(value: unknown): string {
        return value === null || value === undefined ? '' : String(value);
      }

      const path = (typeof profile === 'undefined' ? `/casts/${cast?.hash as string ?? ''}` : `/users/${profile?.username as string ?? ''}`)
      return (
        <div
          key={`${typeof profile === 'undefined'
            ? `cast-${stringify(cast?.hash ?? '')}-${stringify(index)}`
            : `profile-${stringify(profile?.username ?? '')}-${stringify(index)}`}`}
          className="w-full hover:bg-purple-600 transition-colors duration-500 break-inside-avoid">
          <div
            className={`border-t-2 border-purple-800 ${index === 0 ? 'pt-1' : ''} p-2 border-l-2 border-purple-800 md:border-l-0 h-full last:border-b-1`}
            style={{ borderLeft: '2px solid #6b21a8' }}
            onClick={(e) => {
              e.stopPropagation();
              try {
                void router.push(path);
              } catch (error) {
                console.error(error);
              }
            }}
          >
            <div className="flex flex-row p-2 w-full ml-auto">
              <Image
                src={cast?.userAvatarUrl ?? profile?.avatar_url ?? 'https://explorer.farcaster.xyz/avatar.png'}
                alt={`@${cast?.userUsername ?? profile?.username ?? 'unknown'}'s PFP`}
                width={20}
                height={20}
                className="rounded-full w-6 h-6 pointer-events-none"
              />
              <Link href={`/users/${cast?.userUsername || profile?.username || ''}`}>
                <p className="ml-3">@{cast?.userUsername ?? profile?.username ?? ''}</p>
              </Link>
      
              <div className="relative ml-auto group text-sm text-gray-300">
                <p className="block group-hover:hidden xs:hidden">
                  {getRelativeTime(new Date(cast?.published_at ?? new Date()))}
                </p>
                <p className="hidden group-hover:block">
                  {new Date(cast?.published_at ?? new Date()).toUTCString().slice(4, 16)}
                </p>
              </div>
            </div>
            <div className="p-3 break-words justify-center cursor-default" onClick={(e) => e.stopPropagation()}>
              {renderCastText(cast?.text ?? profile?.bio ?? '')}
            </div>
            {/*
            <div className="pt-3 pb-3 float-left">
              <Link href={`https://warpcast.com/${cast?.author_username}/${cast?.hash?.slice(0, 8)}`}>
                <Image src={warpcastIcon} width={24} height={24} alt="Warpcast icon" />
              </Link>
              <HandThumbUpIcon className="w-3 inline-block mr-1" />
              <p className="inline-block text-xs mr-2">{cast?.reactions_count}</p>
              <ArrowPathRoundedSquareIcon className="w-3 inline-block mr-1" />
              <p className="inline-block text-xs">{cast?.recasts_count}</p>
            </div>
            */}
          </div>
        </div>
      );      
}
