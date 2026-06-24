import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Calendar, ShieldCheck, LogOut, X, Edit2, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserProfileModal({ open, onClose, user }: UserProfileModalProps) {
  const { logout, refreshUser } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // Sync state when user changes
  useEffect(() => {
    if (user?.name) {
      setNewName(user.name);
    }
  }, [user]);

  if (!user) return null;

  const handleSaveName = async () => {
    if (!newName.trim() || newName === user.name) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      await api.put('/users/me', { name: newName });
      await refreshUser();
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update name', error);
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* Hide the default shadcn close button using [&>button]:hidden so we only see our custom one */}
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background/80 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl [&>button]:hidden">
        <div className="relative">
          {/* Header Background Gradient */}
          <div className="h-32 bg-gradient-to-br from-primary/80 via-emerald-500/80 to-teal-600/80 w-full" />
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors backdrop-blur-sm z-10"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Avatar & Info */}
          <div className="px-6 pb-6 relative -mt-16 flex flex-col items-center">
            
            {/* Avatar Section */}
            <div className="relative group mb-4">
              <div className="h-32 w-32 rounded-full border-4 border-background bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center overflow-hidden shadow-lg bg-background text-primary">
                <span className="text-4xl font-bold tracking-tight">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>

            {/* Name Section */}
            <div className="flex items-center gap-2 mb-2 w-full justify-center">
              {isEditingName ? (
                <div className="flex items-center gap-2 max-w-[80%]">
                  <Input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-lg font-bold text-center h-10"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveName} disabled={isSavingName}>
                    {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-emerald-600" />}
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground text-center">
                    {user.name}
                  </h2>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {user.is_verified && (
              <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Account
              </span>
            )}

            <div className="w-full mt-8 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone Number</p>
                    <p className="text-sm font-medium text-foreground truncate">{user.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Member Since</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.created_at ? formatDate(user.created_at) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              variant="destructive" 
              className="w-full mt-8 h-12 rounded-xl text-base font-semibold shadow-sm hover:shadow-md transition-all"
              onClick={() => logout()}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
