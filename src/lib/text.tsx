import Link from 'next/link';

export const addHyperlinksToText = (text: string): JSX.Element => {
  const pattern = /(https?:\/\/[^\s]+)/g;
  const twitterXRegex = /https:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+\/status\/\d+/;
  const wordPattern = /\b0x\w+\b/g;

  // adapt to also:
  // - add channel/fip2 support
  // - remove url or image link, just render
  // - support user mentions

  const parts = text.split(pattern);
  const content = parts.map((part, index) => {
    if (pattern.test(part)) {
      //check special list to render opengraph
      if(twitterXRegex.test(part)){
        const tweetId = part.match(/status\/(\d+)/)?.[1];
        // use something other than react-tweet, don't love how it looks(need something wider)
        console.log("Tweet ID", tweetId);
        return (
          <Link href={part} key={index} target="_blank" rel="noopener noreferrer">
            {part}
          </Link>
        );
      }
      else{
        return (
          <Link href={part} key={index} target="_blank" rel="noopener noreferrer">
            {part}
          </Link>
        );
      }
    } else {
      const words = part.split(' ');
      const wordContent = words.map((word, wordIndex) => {
        if (wordPattern.test(word)) {
          const final = `${word} `
          return (
            <Link
              href={`https://etherscan.io/address/${word}`}
              key={wordIndex}
              target="_blank"
              rel="noopener noreferrer"
            >
              {final}
            </Link>
          );
        } else {
          return <span key={wordIndex}>{word} </span>;
        }
      });
      return <span key={index}>{wordContent}</span>;
    }
  });

  return <>{content}</>;
};

export const renderText = (text: string): JSX.Element => {
  const pattern = /(https?:\/\/[^\s]+)/g;
  const twitterXRegex = /https:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+\/status\/\d+/;
  const warpcastRegex = /https:\/\/(?:www\.)?(?:warpcast\.com)/;
  const wordPattern = /\b0x\w+\b/g;

  const parts = text.split(pattern);
  const content = parts.map((part, index) => {
    if (pattern.test(part)) {
      //Twitter/X render
      if(twitterXRegex.test(part)){
        const tweetId = part.match(/status\/(\d+)/)?.[1];
        // use something other than react-tweet, don't love how it looks(need something wider)
        console.log("Tweet ID", tweetId);
        return (
          <Link href={part} key={index} target="_blank" rel="noopener noreferrer">
            {part}
          </Link>
        );
      }
      // Warpcast render
      else if(warpcastRegex.test(part)){
        console.log("Warpcast link", part);
        return (
          <Link href={part} key={index} target="_blank" rel="noopener noreferrer">
            {part}
          </Link>
        );
      }
      else{
        return (
          <Link href={part} key={index} target="_blank" rel="noopener noreferrer">
            {part}
          </Link>
        );
      }
    } else {
      const words = part.split(' ');
      const wordContent = words.map((word, wordIndex) => {
        if (wordPattern.test(word)) {
          const final = `${word} `
          return (
            <Link
              href={`https://etherscan.io/address/${word}`}
              key={wordIndex}
              target="_blank"
              rel="noopener noreferrer"
            >
              {final}
            </Link>
          );
        } else {
          return <span key={wordIndex}>{word} </span>;
        }
      });
      return <span key={index}>{wordContent}</span>;
    }
  });

  return <>{content}</>;
};