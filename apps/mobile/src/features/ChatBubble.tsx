import { clockTime, radius, space, type ChatMessage } from '@e-alert/shared';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

/**
 * One message. `mine` = sent by the person looking at the screen.
 * `tail` = last bubble in a run from the same sender, so it shows the time
 * and the rounded tail corner (Messages-style grouping).
 */
export function ChatBubble({ m, mine, tail, peerInitials }: { m: ChatMessage; mine: boolean; tail: boolean; peerInitials: string }) {
  const c = useColors();

  if (m.from === 'system') {
    return (
      <View style={styles.system} accessible accessibilityLabel={`${m.text}, ${clockTime(m.at)}`}>
        <Text variant="footnote" color="secondaryLabel" align="center">{m.text}</Text>
        <Text variant="caption" color="tertiaryLabel" align="center">{clockTime(m.at)}</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.row, { justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: tail ? space.md : 3 }]}
      accessible
      accessibilityLabel={`${mine ? 'You' : 'Responder'}: ${m.text}. ${clockTime(m.at)}`}>
      {!mine ? (
        <View style={{ width: 30, alignSelf: 'flex-end' }}>{tail ? <Avatar initials={peerInitials} size={28} /> : null}</View>
      ) : null}
      <View style={{ maxWidth: '76%', alignItems: mine ? 'flex-end' : 'flex-start' }}>
        <View
          style={[
            styles.bubble,
            mine
              ? { backgroundColor: c.bubble, borderBottomRightRadius: tail ? 6 : radius.md }
              : { backgroundColor: c.surface, borderBottomLeftRadius: tail ? 6 : radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: c.separator },
          ]}>
          <Text variant="body" style={mine ? { color: '#fff' } : undefined}>{m.text}</Text>
        </View>
        {tail ? (
          <Text variant="caption" color="tertiaryLabel" style={{ marginTop: 3, marginHorizontal: 6 }}>{clockTime(m.at)}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  system: { alignSelf: 'center', alignItems: 'center', marginVertical: space.md, paddingHorizontal: space.xl },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  bubble: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.md, borderCurve: 'continuous' },
});
