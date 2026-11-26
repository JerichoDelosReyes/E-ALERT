import { Redirect } from 'expo-router';

import { useApp } from '@/state/app';

export default function Entry() {
  const { onboarded, role } = useApp();
  if (!onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href={role === 'responder' ? '/duty' : '/home'} />;
}
