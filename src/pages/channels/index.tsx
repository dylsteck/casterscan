import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import Image from 'next/image';
import LiveFeed from '~/components/LiveFeed';
import CopyText from '~/components/CopyText';
import { addHyperlinksToText } from '~/lib/text';
import { warpcastChannels } from '~/utils/warpcast-channels';
import RenderChannelIcon from '~/components/RenderChannelIcon';

const Channel = () => {

  const router = useRouter();
  const { url } = router.query;

  return(
    <>
      <LiveFeed channel={url ?? ''} />
    </>
  )
}
export default Channel;