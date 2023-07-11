import Link from 'next/link';

export const addHyperlinksToText = (text: string): JSX.Element => {
  const pattern = /(https?:\/\/[^\s]+)/g;
  const wordPattern = /\b0x\w+\b/g;

  const parts = text.split(pattern);
  const content = parts.map((part, index) => {
    if (pattern.test(part)) {
      return (
        <Link href={part} key={index} target="_blank" rel="noopener noreferrer">
          {part}
        </Link>
      );
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