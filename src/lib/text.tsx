import Link from 'next/link';

export const addHyperlinksToText = (text: string): JSX.Element => {
    const pattern = /(https?:\/\/[^\s]+)/g;
  
    const parts = text.split(pattern);
    const content = parts.map((part, index) => {
      if (pattern.test(part)) {
        return (
          <Link href={part} key={index} target="_blank" rel="noopener noreferrer">
            {part}
          </Link>
        );
      }
      else {
        return <span key={index}>{part}</span>;
      }
    });
    return <>{content}</>;
  };