import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreVertical, Flag, Ban } from 'lucide-react';
import { useBlockUser } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ReportBlockMenuProps {
  targetUserId: string;
  targetName: string;
}

const REPORT_CATEGORIES = ['Harassment', 'Spam', 'Inappropriate Content', 'Other'];

export default function ReportBlockMenu({ targetUserId, targetName }: ReportBlockMenuProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { mutate: blockUser } = useBlockUser();

  const handleReportClick = (category: string) => {
    setSelectedCategory(category);
    setShowReportDialog(true);
  };

  const handleReportConfirm = () => {
    toast.success(`Report submitted for ${targetName}`);
    setShowReportDialog(false);
    setSelectedCategory('');
  };

  const handleBlockConfirm = () => {
    blockUser(targetUserId);
    setShowBlockDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
            <Flag className="h-4 w-4 mr-2" />
            Report User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowBlockDialog(true)} className="text-destructive">
            <Ban className="h-4 w-4 mr-2" />
            Block User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report {targetName}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCategory ? (
                <>Are you sure you want to report this user for {selectedCategory.toLowerCase()}?</>
              ) : (
                <>Select a reason for reporting:</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!selectedCategory ? (
            <div className="space-y-2">
              {REPORT_CATEGORIES.map((category) => (
                <Button key={category} variant="outline" className="w-full justify-start" onClick={() => handleReportClick(category)}>
                  {category}
                </Button>
              ))}
            </div>
          ) : (
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedCategory('')}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReportConfirm}>Submit Report</AlertDialogAction>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {targetName}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block this user? They will no longer be able to interact with you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
