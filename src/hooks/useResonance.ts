import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type ResonanceColor = 'neutral' | 'white' | 'pink' | 'cyan' | 'yellow';

export interface ResonanceState {
  color: ResonanceColor;
  lastNudge: number | null;
}

export function useResonance(pin: string | null) {
  const [partnerState, setPartnerState] = useState<ResonanceState>({ color: 'neutral', lastNudge: null });
  const [myState, setMyState] = useState<ResonanceState>({ color: 'neutral', lastNudge: null });
  const [isConnected, setIsConnected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!pin) return;

    // Use a unique channel name based on the PIN
    const roomChannel = supabase.channel(`room:${pin}`, {
      config: {
        broadcast: { ack: true },
      },
    });

    roomChannel
      .on('broadcast', { event: 'state_update' }, (payload) => {
        setPartnerState(payload.payload as ResonanceState);
      })
      .on('broadcast', { event: 'nudge' }, (payload) => {
        const timestamp = payload.payload.timestamp;
        setPartnerState((prev) => ({ ...prev, lastNudge: timestamp }));
        // Trigger haptic feedback when a nudge is received
        if (typeof window !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      })
      .on('broadcast', { event: 'request_state' }, () => {
        // When partner asks for state (e.g. they just joined), we broadcast our current state
        if (myState.color !== 'neutral') {
           roomChannel.send({
            type: 'broadcast',
            event: 'state_update',
            payload: myState,
          });
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Ask for the current state from the partner when joining
          roomChannel.send({
            type: 'broadcast',
            event: 'request_state',
            payload: {},
          });
        }
      });

    setChannel(roomChannel);

    return () => {
      supabase.removeChannel(roomChannel);
      setIsConnected(false);
    };
  }, [pin]); // Removed myState dependency here to avoid reconnecting on state change

  // When my state changes (color), broadcast it
  useEffect(() => {
    if (isConnected && channel) {
      channel.send({
        type: 'broadcast',
        event: 'state_update',
        payload: myState,
      });
    }
  }, [myState.color, isConnected, channel]); // only run when color or connection changes

  const updateColor = useCallback((color: ResonanceColor) => {
    setMyState((prev) => ({ ...prev, color }));
  }, []);

  const sendNudge = useCallback(() => {
    const timestamp = Date.now();
    setMyState((prev) => ({ ...prev, lastNudge: timestamp }));
    if (isConnected && channel) {
      channel.send({
        type: 'broadcast',
        event: 'nudge',
        payload: { timestamp },
      });
    }
  }, [isConnected, channel]);

  return {
    myState,
    partnerState,
    isConnected,
    updateColor,
    sendNudge,
  };
}
