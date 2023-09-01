import React from 'react';
import { useRouter } from 'next/router';
import LiveFeed from '~/components/LiveFeed';

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