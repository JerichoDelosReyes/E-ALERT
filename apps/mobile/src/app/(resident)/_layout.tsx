import { RoleTabs } from '@/ui/RoleTabs';

export default function ResidentLayout() {
  return (
    <RoleTabs
      tabs={[
        { name: 'home', label: 'Home', icon: 'home' },
        { name: 'map', label: 'Map', icon: 'map' },
        { name: 'contacts', label: 'Contacts', icon: 'contacts' },
        { name: 'profile', label: 'Profile', icon: 'profile' },
      ]}
    />
  );
}
