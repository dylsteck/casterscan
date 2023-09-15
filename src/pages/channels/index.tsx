import React from 'react';
import { useRouter } from 'next/router';
import LiveFeed from '~/components/LiveFeed';

const Channel = () => {
  const router = useRouter();
  const { url } = router.query;
  const channelUrl = url as string ?? '';

  return (
    <>
      <LiveFeed channel={channelUrl} />
    </>
  )
}

export default Channel;