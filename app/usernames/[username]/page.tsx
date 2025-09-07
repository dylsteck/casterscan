import { getNeynarUserByUsername } from '@/app/lib/server';
import { redirect, notFound } from 'next/navigation';
import { Skeleton } from '@/app/components/custom/skeleton';

export default async function UsernamePage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  const { username } = params;
  
  try {
    const user = await getNeynarUserByUsername(username);
    
    if (user?.fid) {
      redirect(`/fids/${user.fid}`);
    } else {
      notFound();
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    notFound();
  }
  
  return <Skeleton variant="card" rows={5} />;
}
