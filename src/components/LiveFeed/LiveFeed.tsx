import HomeLiveFeed from "./HomeLiveFeed";

interface LiveFeedProps {
    channel?: string;
    hash?: string;
    user?: string;
}

export default function LiveFeed({ channel, hash, user }: LiveFeedProps) {
    
   const renderLiveFeed = () => {
      if(channel){
        // channel live feed
      } else if(hash){
        // cast replies live feed
      } else if(user){
        // user live feed
      }
      return <HomeLiveFeed />
   };

  return(
    <>
        {renderLiveFeed()}
    </>
  )
}