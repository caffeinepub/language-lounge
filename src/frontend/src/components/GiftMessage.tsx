import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useGetUserProfile, useGetGiftCatalog } from '../hooks/useQueries';
import { Gift as GiftIcon } from 'lucide-react';
import type { GiftTransaction } from '../backend';

interface GiftMessageProps {
  transaction: GiftTransaction;
}

export default function GiftMessage({ transaction }: GiftMessageProps) {
  const { data: senderProfile } = useGetUserProfile(transaction.sender.toString());
  const { data: recipientProfile } = useGetUserProfile(transaction.recipient.toString());
  const { data: giftCatalog = [] } = useGetGiftCatalog();
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  const gift = giftCatalog.find((g) => Number(g.id) === Number(transaction.giftId));

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const senderName = senderProfile?.name || 'Someone';
  const recipientName = recipientProfile?.name || 'Someone';

  const timestamp = new Date(Number(transaction.timestamp) / 1000000);
  const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Card
      className={`border-2 border-terracotta/30 bg-gradient-to-br from-terracotta/5 via-coral/5 to-peach/10 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {gift && !imageError ? (
              <img
                src={gift.icon.getDirectURL()}
                alt={gift.name}
                className="w-16 h-16 object-contain animate-bounce"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-terracotta/20 to-coral/20 rounded-full flex items-center justify-center">
                {gift && imageError ? (
                  <span className="text-2xl font-bold text-terracotta">{gift.name.charAt(0)}</span>
                ) : (
                  <GiftIcon className="h-8 w-8 text-terracotta" />
                )}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              <span className="text-terracotta font-bold">{senderName}</span>
              {' sent '}
              <span className="text-coral font-bold">{gift?.name || 'a gift'}</span>
              {' to '}
              <span className="text-sage font-bold">{recipientName}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{timeString}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
