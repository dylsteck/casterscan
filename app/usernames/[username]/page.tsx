import ProfileDetails from '@/app/components/custom/profile-details/index';
import { getNeynarUserByUsername, getFarcasterKeys } from '@/app/lib/server';
import { notFound } from 'next/navigation';

export default async function UsernamePage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  const { username } = params;
  
  try {
    const user = await getNeynarUserByUsername(username);

    if (!user?.fid) {
      notFound();
    }

    const keysData = await getFarcasterKeys(user.fid.toString());

    if (!keysData) {
      notFound();
    }

    return <ProfileDetails fid={user.fid.toString()} neynarUser={user} keysData={keysData} />;
  } catch (error) {
    notFound();
  }
}
