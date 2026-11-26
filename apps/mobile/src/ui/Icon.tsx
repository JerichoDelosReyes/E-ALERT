import Ionicons from '@expo/vector-icons/Ionicons';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Platform, type ColorValue, type StyleProp, type ViewStyle } from 'react-native';

type Ion = ComponentProps<typeof Ionicons>['name'];

/** One name per concept: SF Symbol on iOS, Ionicons on Android. */
export const ICONS = {
  home: ['house.fill', 'home'],
  map: ['map.fill', 'map'],
  contacts: ['person.2.fill', 'people'],
  profile: ['person.crop.circle.fill', 'person-circle'],
  bell: ['bell', 'notifications-outline'],
  help: ['questionmark.circle', 'help-circle-outline'],
  phone: ['phone.fill', 'call'],
  message: ['message.fill', 'chatbubble'],
  close: ['xmark', 'close'],
  back: ['chevron.left', 'chevron-back'],
  chevron: ['chevron.right', 'chevron-forward'],
  check: ['checkmark', 'checkmark'],
  checkCircle: ['checkmark.circle.fill', 'checkmark-circle'],
  location: ['location.fill', 'navigate'],
  pin: ['mappin.and.ellipse', 'location'],
  shield: ['checkmark.shield.fill', 'shield-checkmark'],
  heart: ['heart.text.square.fill', 'medkit'],
  eye: ['eye.fill', 'eye'],
  lock: ['lock.fill', 'lock-closed'],
  faceid: ['faceid', 'finger-print'],
  plus: ['plus', 'add'],
  people: ['person.3.fill', 'people'],
  house: ['house.lodge.fill', 'business'],
  backup: ['person.badge.plus', 'person-add'],
  flag: ['flag.checkered', 'flag'],
  steering: ['car.fill', 'car'],
  duty: ['bolt.shield.fill', 'shield'],
  id: ['person.text.rectangle.fill', 'id-card'],
  moon: ['moon.fill', 'moon'],
  sun: ['sun.max.fill', 'sunny'],
  gear: ['gearshape.fill', 'settings'],
  swap: ['arrow.left.arrow.right', 'swap-horizontal'],
  camera: ['camera.fill', 'camera'],
  mic: ['mic.fill', 'mic'],
  wave: ['dot.radiowaves.left.and.right', 'radio'],
  eyeToo: ['hand.raised.fill', 'hand-left'],
  clock: ['clock.fill', 'time'],
  doc: ['doc.text.fill', 'document-text'],
  chat: ['bubble.left.and.bubble.right.fill', 'chatbubbles'],
  send: ['arrow.up', 'arrow-up'],
  zoomIn: ['plus', 'add'],
  zoomOut: ['minus', 'remove'],
  fit: ['arrow.up.left.and.arrow.down.right', 'expand'],
  search: ['magnifyingglass', 'search'],
  car: ['car.fill', 'car'],
  verified: ['checkmark.seal.fill', 'checkmark-circle'],
  xmark: ['xmark.circle.fill', 'close-circle'],
  at: ['at', 'at'],
  eyeOff: ['eye.slash.fill', 'eye-off'],
  person: ['person.fill', 'person'],
  logout: ['rectangle.portrait.and.arrow.right', 'log-out-outline'],
  apple: ['apple.logo', 'logo-apple'],
  // Categories & statuses come from shared tokens (sf/ion pairs).
} as const satisfies Record<string, readonly [string, Ion]>;

export type IconName = keyof typeof ICONS;

type Props = {
  name?: IconName;
  /** Escape hatch for token-driven icons (categoryMeta etc.). */
  pair?: { sf: string; ion: string };
  size?: number;
  color: ColorValue;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, pair, size = 22, color, weight = 'semibold', style }: Props) {
  const [sf, ion] = pair ? [pair.sf, pair.ion] : ICONS[name!];
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={sf as SFSymbol}
        size={size}
        tintColor={color as string}
        weight={weight}
        resizeMode="scaleAspectFit"
        style={[{ width: size, height: size }, style]}
      />
    );
  }
  return <Ionicons name={ion as Ion} size={size} color={color as string} style={style as never} />;
}
