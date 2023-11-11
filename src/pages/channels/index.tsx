import React from 'react';
import { useRouter } from 'next/router';
import LiveFeed from '~/components/LiveFeed/LiveFeed';
import ChannelLiveFeed from '~/components/LiveFeed/ChannelLiveFeed';

const Channel = () => {
  const router = useRouter();
  const { url } = router.query;
  const channelUrl = url as string ?? '';

  return (
    <>
      <ChannelLiveFeed channel={channelUrl} />
    </>
  )
}

export default Channel;