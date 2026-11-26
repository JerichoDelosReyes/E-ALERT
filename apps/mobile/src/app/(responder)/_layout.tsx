import { RoleTabs } from '@/ui/RoleTabs';

/** Responder side: limited on purpose. No charts, no analytics. */
export default function ResponderLayout() {
  return (
    <RoleTabs
      tabs={[
        { name: 'duty', label: 'Duty', icon: 'duty' },
        { name: 'navigate', label: 'Navigate', icon: 'location' },
        { name: 'account', label: 'Account', icon: 'profile' },
      ]}
    />
  );
}
