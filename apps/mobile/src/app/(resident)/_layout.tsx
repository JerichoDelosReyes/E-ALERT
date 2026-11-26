import { useApp } from '@/state/app';
import { RoleTabs } from '@/ui/RoleTabs';

export default function ResidentLayout() {
  const { unreadCount } = useApp();
  return (
    <RoleTabs
      tabs={[
        { name: 'home', label: 'Home', icon: 'home' },
        { name: 'map', label: 'Map', icon: 'map' },
        { name: 'chat', label: 'Chat', icon: 'chat', badge: unreadCount() },
        { name: 'contacts', label: 'Contacts', icon: 'contacts' },
        { name: 'profile', label: 'Profile', icon: 'profile' },
      ]}
    />
  );
}
