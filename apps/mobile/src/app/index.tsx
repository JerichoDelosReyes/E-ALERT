import { Redirect } from 'expo-router';

import { useAppState } from '@/state/app';

export default function Entry() {
  const onboarded = useAppState((s) => s.onboarded);
  const role = useAppState((s) => s.role);
  if (!onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href={role === 'responder' ? '/duty' : '/home'} />;
}
