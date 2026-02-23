import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Message, RoomType, Gift, GiftTransaction } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useGetUserProfile(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const principal = Principal.fromText(userId);
        return await actor.getUserProfile(principal);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGetRoomMessages(roomId: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['roomMessages', roomId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRoomMessages(BigInt(roomId));
    },
    enabled: !!actor && !actorFetching && roomId !== undefined,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, content }: { roomId: number; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendMessage(BigInt(roomId), content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roomMessages', variables.roomId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });
}

export function useCreateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, roomType }: { name: string; roomType: RoomType }) => {
      if (!actor) throw new Error('Actor not available');
      const roomId = await actor.createRoom(name, roomType);
      return Number(roomId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create room: ${error.message}`);
    },
  });
}

export function useDeleteRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: number) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteRoom(BigInt(roomId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete room: ${error.message}`);
    },
  });
}

export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(targetUserId);
      await actor.blockUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      toast.success('User blocked successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to block user: ${error.message}`);
    },
  });
}

export function useIsBlocked(targetUserId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isBlocked', targetUserId],
    queryFn: async () => {
      if (!actor) return false;
      try {
        const principal = Principal.fromText(targetUserId);
        return await actor.isBlocked(principal);
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!targetUserId,
  });
}

export function useTranslateText() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ text, sourceLang, targetLang }: { text: string; sourceLang: string; targetLang: string }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.translateText(text, sourceLang, targetLang);
    },
    onError: (error: Error) => {
      toast.error(`Translation failed: ${error.message}`);
    },
  });
}

export function useGetGiftCatalog() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Gift[]>({
    queryKey: ['giftCatalog'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGiftCatalog();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSendGift() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, recipient, giftId }: { roomId: number; recipient: Principal; giftId: number }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendGift(BigInt(roomId), recipient, BigInt(giftId));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roomGiftHistory', variables.roomId] });
      toast.success('Gift sent successfully! 🎁');
    },
    onError: (error: Error) => {
      toast.error(`Failed to send gift: ${error.message}`);
    },
  });
}

export function useGetRoomGiftHistory(roomId: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GiftTransaction[]>({
    queryKey: ['roomGiftHistory', roomId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRoomGiftHistory(BigInt(roomId));
    },
    enabled: !!actor && !actorFetching && roomId !== undefined,
    refetchInterval: 3000,
  });
}

// Stranger video calling hooks
export function useJoinStrangerQueue() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.joinStrangerQueue();
    },
    onError: (error: Error) => {
      toast.error(`Failed to join queue: ${error.message}`);
    },
  });
}

export function usePairWithStranger() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const roomId = await actor.pairWithStranger();
      return Number(roomId);
    },
    onError: (error: Error) => {
      // Don't show error toast for "no available strangers" as this is expected during polling
      if (!error.message?.includes('No available strangers')) {
        toast.error(`Failed to pair with stranger: ${error.message}`);
      }
    },
  });
}

export function useRemoveFromStrangerQueue() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeFromStrangerQueue();
    },
    onError: (error: Error) => {
      toast.error(`Failed to leave queue: ${error.message}`);
    },
  });
}

export function useGetStrangerRoomMessages(roomId: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['strangerRoomMessages', roomId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStrangerRoomMessages(BigInt(roomId));
    },
    enabled: !!actor && !actorFetching && roomId !== undefined && roomId > 0,
    refetchInterval: 3000,
  });
}

export function useSendStrangerRoomMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, content }: { roomId: number; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendStrangerRoomMessage(BigInt(roomId), content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['strangerRoomMessages', variables.roomId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });
}
