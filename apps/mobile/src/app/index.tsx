import { Redirect } from 'expo-router';
import { useEffect } from 'react';

import { useAppState } from '@/state/app';
import { initAuth, useAuth } from '@/state/auth';

export default function Entry() {
  const onboarded = useAppState((s) => s.onboarded);
  const ready = useAuth((s) => s.ready);
  const session = useAuth((s) => s.session);
  useEffect(() => { initAuth(); }, []);

  if (!ready) return null;
  if (session) return <Redirect href={session.role === 'responder' ? '/duty' : '/home'} />;
  if (!onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/login" />;
}
