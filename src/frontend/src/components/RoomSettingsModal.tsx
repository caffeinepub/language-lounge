import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { useDeleteRoom } from '../hooks/useQueries';

interface RoomSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: number;
}

export default function RoomSettingsModal({ open, onOpenChange, roomId }: RoomSettingsModalProps) {
  const navigate = useNavigate();
  const { mutate: deleteRoom, isPending } = useDeleteRoom();

  const handleDelete = () => {
    deleteRoom(roomId, {
      onSuccess: () => {
        onOpenChange(false);
        navigate({ to: '/' });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Room Settings</DialogTitle>
          <DialogDescription>Manage your room settings and preferences</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Room
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the room and remove all participants.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isPending ? 'Deleting...' : 'Delete Room'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
