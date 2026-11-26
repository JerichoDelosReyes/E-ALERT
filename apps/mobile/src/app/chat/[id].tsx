import { chatThreads, quickReplies, radius, responders, space } from '@e-alert/shared';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatBubble } from '@/features/ChatBubble';
import { appActions, useAppState } from '@/state/app';
import { Glass } from '@/ui/Glass';
import { Icon } from '@/ui/Icon';
import { Avatar, Chip, GlassIconButton } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

const HEADER_H = 64;

export default function Thread() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sendMessage, markRead } = appActions;
  const role = useAppState((s) => s.role);
  const messages = useAppState((s) => s.messages);
  const [draft, setDraft] = useState('');

  const thread = chatThreads.find((t) => t.id === id);
  const responder = responders.find((r) => r.id === thread?.responderId);
  const list = useMemo(() => messages.filter((m) => m.threadId === id), [messages, id]);
  const reversed = useMemo(() => [...list].reverse(), [list]);

  // Opening the thread reads everything in it, including replies that arrive while open.
  useEffect(() => { if (id) markRead(id); }, [id, list.length, markRead]);

  if (!thread || !responder) {
    return (
      <SafeAreaView style={[styles.missing, { backgroundColor: c.bg }]}>
        <Text variant="headline">This conversation is no longer available.</Text>
        <Chip label="Go back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const peer = role === 'resident'
    ? { name: responder.name, initials: responder.initials, sub: `${responder.department} · Tier ${responder.tier}`, phone: '+639175550101' }
    : { name: thread.residentName, initials: thread.residentInitials, sub: 'Reporter', phone: '+639175550142' };

  const send = (text: string) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(thread.id, text);
    setDraft('');
  };

  const canSend = draft.trim().length > 0 && thread.active;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <FlatList
            inverted
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={11}
            data={reversed}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: HEADER_H + space.lg }}
            keyboardDismissMode="interactive"
            renderItem={({ item, index }) => {
              // In an inverted list, index-1 is the *next* message in time.
              const next = reversed[index - 1];
              const tail = !next || next.from !== item.from;
              return <ChatBubble m={item} mine={item.from === role} tail={tail} peerInitials={peer.initials} />;
            }}
          />

          {thread.active ? (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.sm }}
                style={{ flexGrow: 0 }}
                accessibilityLabel="Quick replies">
                {quickReplies[role].map((qr) => <Chip key={qr} label={qr} onPress={() => send(qr)} />)}
              </ScrollView>

              <SafeAreaView edges={['bottom']} style={[styles.composer, { borderTopColor: c.separator }]}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Message"
                  placeholderTextColor={c.secondaryLabel}
                  multiline
                  maxLength={500}
                  style={[styles.input, { backgroundColor: c.surface, borderColor: c.separator, color: c.label }]}
                  accessibilityLabel="Message"
                />
                <Pressable
                  onPress={() => send(draft)}
                  disabled={!canSend}
                  accessibilityRole="button"
                  accessibilityLabel="Send message"
                  accessibilityState={{ disabled: !canSend }}
                  hitSlop={6}
                  style={[styles.send, { backgroundColor: canSend ? c.bubble : c.fillStrong }]}>
                  <Icon name="send" size={18} color="#fff" weight="bold" />
                </Pressable>
              </SafeAreaView>
            </>
          ) : (
            <SafeAreaView edges={['bottom']} style={[styles.closed, { borderTopColor: c.separator }]}>
              <Icon name="checkCircle" size={16} color={c.safe} />
              <Text variant="footnote" color="secondaryLabel">This incident is resolved. The conversation is closed.</Text>
            </SafeAreaView>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Floating glass header (functional layer) */}
      <SafeAreaView edges={['top']} pointerEvents="box-none" style={styles.headerWrap}>
        <View style={styles.header}>
          <GlassIconButton icon="back" label="Back" onPress={() => router.back()} size={44} />
          <Glass style={styles.titlePill}>
            <Avatar initials={peer.initials} size={34} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text variant="headline" numberOfLines={1} style={{ flexShrink: 1 }}>{peer.name}</Text>
                {role === 'resident' ? <Icon name="verified" size={14} color={c.action} /> : null}
              </View>
              <Text variant="caption" numberOfLines={1}>
                {peer.sub}{thread.active ? ' · On the way' : ' · Closed'}
              </Text>
            </View>
          </Glass>
          <GlassIconButton icon="phone" label={`Call ${peer.name}`} tint={c.safe} size={44} onPress={() => Linking.openURL(`tel:${peer.phone}`)} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  headerWrap: { position: 'absolute', top: 0, left: 0, right: 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.xs, height: HEADER_H },
  titlePill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, height: 50, borderRadius: 25, paddingLeft: 8, paddingRight: 14 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.sm, marginTop: space.sm, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, minHeight: 40, maxHeight: 110, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, fontSize: 17, marginBottom: space.sm },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  closed: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth },
});
