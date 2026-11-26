import { useUnread } from '@/state/app';
import { RoleTabs } from '@/ui/RoleTabs';

export default function ResidentLayout() {
  const unread = useUnread();
  return (
    <RoleTabs
      tabs={[
        { name: 'home', label: 'Home', icon: 'home' },
        { name: 'map', label: 'Map', icon: 'map' },
        { name: 'chat', label: 'Chat', icon: 'chat', badge: unread },
        { name: 'contacts', label: 'Contacts', icon: 'contacts' },
        { name: 'profile', label: 'Profile', icon: 'profile' },
      ]}
    />
  );
}
