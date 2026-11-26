import { categoryMeta, chatThreads, radius, responders, space, timeAgo, type ChatThread } from '@e-alert/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useAppState, useUnread } from '@/state/app';
import { Icon } from '@/ui/Icon';
import { Avatar, Grouped, LargeTitleScreen, StatusPill } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

export default function Chats() {
  const c = useColors();
  const [q, setQ] = useState('');
  const match = (t: ChatThread) => {
    const r = responders.find((x) => x.id === t.responderId);
    return !q.trim() || (r?.name ?? '').toLowerCase().includes(q.trim().toLowerCase());
  };
  const active = chatThreads.filter((t) => t.active && match(t));
  const earlier = chatThreads.filter((t) => !t.active && match(t));

  return (
    <LargeTitleScreen title="Chats">
      <View style={[styles.search, { backgroundColor: c.fill }]}>
        <Icon name="search" size={16} color={c.secondaryLabel} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search"
          placeholderTextColor={c.secondaryLabel}
          style={[styles.searchInput, { color: c.label }]}
          accessibilityLabel="Search conversations"
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {active.length === 0 && earlier.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="chat" size={40} color={c.tertiaryLabel} />
          <Text variant="headline" align="center" style={{ marginTop: space.md }}>
            {q ? 'No matches' : 'No conversations yet'}
          </Text>
          <Text variant="subhead" color="secondaryLabel" align="center" style={{ marginTop: 4, maxWidth: 280 }}>
            {q ? 'Try a different name.' : 'When a responder accepts your alert, you can message them here.'}
          </Text>
        </View>
      ) : null}

      {active.length ? (
        <Grouped title="Active">
          {active.map((t, i) => <ThreadRow key={t.id} t={t} last={i === active.length - 1} />)}
        </Grouped>
      ) : null}
      {earlier.length ? (
        <Grouped title="Earlier" footer="Conversations close when the incident is resolved.">
          {earlier.map((t, i) => <ThreadRow key={t.id} t={t} last={i === earlier.length - 1} />)}
        </Grouped>
      ) : null}
    </LargeTitleScreen>
  );
}

function ThreadRow({ t, last }: { t: ChatThread; last: boolean }) {
  const c = useColors();
  const messages = useAppState((s) => s.messages);
  const r = responders.find((x) => x.id === t.responderId)!;
  const thread = messages.filter((m) => m.threadId === t.id);
  const latest = thread[thread.length - 1];
  const unread = useUnread(t.id);
  const cat = categoryMeta[t.category];
  const preview = latest ? `${latest.from === 'resident' ? 'You: ' : ''}${latest.text}` : '';

  return (
    <Pressable
      onPress={() => router.push(`/chat/${t.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${r.name}, ${cat.label}. ${unread ? `${unread} unread. ` : ''}Last message: ${preview}`}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: c.fill }]}>
      <View>
        <Avatar initials={r.initials} size={52} />
        <View style={[styles.verified, { backgroundColor: c.surface }]}>
          <Icon name="verified" size={16} color={c.action} />
        </View>
        {t.active ? <View style={[styles.online, { backgroundColor: c.safe, borderColor: c.surface }]} /> : null}
      </View>
      <View style={[styles.body, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.separator }]}>
        <View style={styles.line}>
          <Text variant="headline" numberOfLines={1} style={{ flex: 1 }}>{r.name}</Text>
          <Text variant="footnote" color={unread ? 'action' : 'secondaryLabel'}>{latest ? timeAgo(latest.at) : ''}</Text>
        </View>
        <View style={{ marginVertical: 4 }}>
          <StatusPill label={cat.label} pair={cat} tone={cat.color} />
        </View>
        <View style={styles.line}>
          <Text variant="subhead" color={unread ? 'label' : 'secondaryLabel'} weight={unread ? '600' : '400'} numberOfLines={1} style={{ flex: 1 }}>
            {preview}
          </Text>
          {unread ? (
            <View style={[styles.badge, { backgroundColor: c.action }]}>
              <Text variant="caption" weight="700" style={{ color: '#fff' }}>{unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, borderRadius: radius.sm, paddingHorizontal: 12, marginBottom: space.xl },
  searchInput: { flex: 1, fontSize: 17, height: 40 },
  empty: { alignItems: 'center', paddingVertical: space.xxxl },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingLeft: space.lg },
  body: { flex: 1, paddingVertical: space.md, paddingRight: space.lg },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  verified: { position: 'absolute', top: -3, right: -4, borderRadius: 10, padding: 1 },
  online: { position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: 7, borderWidth: 2 },
  badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
});
