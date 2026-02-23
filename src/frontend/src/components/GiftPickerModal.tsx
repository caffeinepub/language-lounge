import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useGetGiftCatalog, useSendGift } from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { Gift as GiftIcon, Loader2 } from 'lucide-react';
import type { Gift } from '../backend';

interface Participant {
  id: string;
  name: string;
}

interface GiftPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: number;
  participants: Participant[];
}

export default function GiftPickerModal({ open, onOpenChange, roomId, participants }: GiftPickerModalProps) {
  const { data: giftCatalog = [], isLoading: catalogLoading } = useGetGiftCatalog();
  const { mutate: sendGift, isPending } = useSendGift();
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [step, setStep] = useState<'recipient' | 'gift' | 'confirm'>('recipient');
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleClose = () => {
    setSelectedRecipient('');
    setSelectedGift(null);
    setStep('recipient');
    setImageErrors(new Set());
    onOpenChange(false);
  };

  const handleRecipientNext = () => {
    if (selectedRecipient) {
      setStep('gift');
    }
  };

  const handleGiftSelect = (gift: Gift) => {
    setSelectedGift(gift);
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (selectedRecipient && selectedGift) {
      try {
        const recipientPrincipal = Principal.fromText(selectedRecipient);
        sendGift(
          { roomId, recipient: recipientPrincipal, giftId: Number(selectedGift.id) },
          {
            onSuccess: () => {
              handleClose();
            },
          }
        );
      } catch (error) {
        console.error('Invalid principal:', error);
      }
    }
  };

  const handleImageError = (giftId: number) => {
    setImageErrors((prev) => new Set(prev).add(giftId));
  };

  const recipientName = participants.find((p) => p.id === selectedRecipient)?.name || '';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <GiftIcon className="h-5 w-5 text-terracotta" />
            Send a Gift
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {step === 'recipient' && 'Choose who you want to send a gift to'}
            {step === 'gift' && 'Select a gift from the catalog'}
            {step === 'confirm' && 'Confirm your gift'}
          </DialogDescription>
        </DialogHeader>

        {step === 'recipient' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Select Recipient</label>
              <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Choose a participant..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {participants.map((participant) => (
                    <SelectItem key={participant.id} value={participant.id} className="text-white focus:bg-gray-700">
                      {participant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                Cancel
              </Button>
              <Button onClick={handleRecipientNext} disabled={!selectedRecipient} className="bg-gradient-to-r from-terracotta to-coral hover:from-terracotta/90 hover:to-coral/90 text-white">
                Next
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'gift' && (
          <div className="space-y-4 py-4">
            {catalogLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
              </div>
            ) : giftCatalog.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No gifts available at the moment</p>
              </div>
            ) : (
              <ScrollArea className="h-[450px] pr-4">
                <div className="grid grid-cols-4 gap-4">
                  {giftCatalog.map((gift) => (
                    <Card
                      key={Number(gift.id)}
                      className="cursor-pointer hover:shadow-xl transition-all border-2 border-gray-800 hover:border-terracotta bg-black/40 hover:bg-black/60"
                      onClick={() => handleGiftSelect(gift)}
                    >
                      <CardContent className="p-4 flex flex-col items-center gap-3">
                        {imageErrors.has(Number(gift.id)) ? (
                          <div className="w-24 h-24 bg-gradient-to-br from-terracotta/20 to-coral/20 rounded-lg flex items-center justify-center">
                            <span className="text-4xl font-bold text-white">{gift.name.charAt(0)}</span>
                          </div>
                        ) : (
                          <img
                            src={gift.icon.getDirectURL()}
                            alt={gift.name}
                            className="w-24 h-24 object-contain"
                            onError={() => handleImageError(Number(gift.id))}
                          />
                        )}
                        <h3 className="font-medium text-center text-sm text-white leading-tight">{gift.name}</h3>
                        <p className="text-gray-300 font-semibold text-sm">{Number(gift.price)} Coins</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
            <DialogFooter>
              <Button onClick={() => setStep('recipient')} variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                Back
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'confirm' && selectedGift && (
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-br from-terracotta/10 via-coral/10 to-peach/10 rounded-lg p-6 space-y-4 border border-gray-800">
              <div className="flex items-center justify-center">
                {imageErrors.has(Number(selectedGift.id)) ? (
                  <div className="w-32 h-32 bg-gradient-to-br from-terracotta/20 to-coral/20 rounded-lg flex items-center justify-center">
                    <span className="text-6xl font-bold text-white">{selectedGift.name.charAt(0)}</span>
                  </div>
                ) : (
                  <img
                    src={selectedGift.icon.getDirectURL()}
                    alt={selectedGift.name}
                    className="w-32 h-32 object-contain"
                    onError={() => handleImageError(Number(selectedGift.id))}
                  />
                )}
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">{selectedGift.name}</h3>
                <p className="text-2xl font-bold text-terracotta">{Number(selectedGift.price)} Coins</p>
              </div>
              <div className="border-t border-gray-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">To:</span>
                  <span className="font-medium text-white">{recipientName}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setStep('gift')} variant="outline" disabled={isPending} className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                Back
              </Button>
              <Button onClick={handleConfirm} disabled={isPending} className="bg-gradient-to-r from-terracotta to-coral hover:from-terracotta/90 hover:to-coral/90 text-white">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Gift'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
