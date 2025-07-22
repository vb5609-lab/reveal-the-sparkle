import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Share2, 
  Copy, 
  Facebook, 
  Twitter, 
  Linkedin,
  MessageCircle,
  Instagram,
  Download,
  Mail,
  Link,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

interface ShareDialogProps {
  imageUrl: string;
  isCompleted: boolean;
  onDownload: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ 
  imageUrl, 
  isCompleted, 
  onDownload 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const shareText = "🎨✨ I just scratched and revealed this incredible hidden image! Come try this amazing scratch-to-reveal experience! #ImageReveal #Discovery #Interactive";
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const hashtags = "ImageReveal,Discovery,Interactive,Amazing";

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        if (typeof window === 'undefined') return;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        window.open(whatsappUrl, '_blank');
        toast.success('Opening WhatsApp! 📱');
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        if (typeof window === 'undefined') return;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
        toast.success('Opening Facebook! 👥');
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => {
        if (typeof window === 'undefined') return;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        toast.success('Opening Twitter! 🐦');
      }
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => {
        if (typeof window === 'undefined') return;
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('Amazing Image Revealed!')}&summary=${encodeURIComponent(shareText)}`;
        window.open(linkedinUrl, '_blank', 'width=600,height=400');
        toast.success('Opening LinkedIn! 💼');
      }
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-400 hover:bg-sky-500',
      action: () => {
        if (typeof window === 'undefined') return;
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(telegramUrl, '_blank');
        toast.success('Opening Telegram! ✈️');
      }
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => {
        if (typeof window === 'undefined') return;
        const emailSubject = encodeURIComponent('Amazing Image Revealed! ✨');
        const emailBody = encodeURIComponent(`${shareText}\n\nCheck it out here: ${shareUrl}`);
        const mailtoUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        window.location.href = mailtoUrl;
        toast.success('Opening email app! 📧');
      }
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      action: async () => {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
        // Try to open Instagram app first, then fallback to web
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
        const isAndroid = /android/i.test(userAgent);
        
        if (isIOS) {
          // Try to open Instagram app on iOS
          window.location.href = 'instagram://';
          // Fallback to App Store if app not installed
          setTimeout(() => {
            window.open('https://apps.apple.com/app/instagram/id389801252', '_blank');
          }, 2000);
        } else if (isAndroid) {
          // Try to open Instagram app on Android
          window.location.href = 'intent://instagram.com#Intent;package=com.instagram.android;scheme=https;end';
          // Fallback to Play Store if app not installed
          setTimeout(() => {
            window.open('https://play.google.com/store/apps/details?id=com.instagram.android', '_blank');
          }, 2000);
        } else {
          // Desktop: open Instagram web
          window.open('https://www.instagram.com/', '_blank');
        }
        
        // Also copy the image URL for easy sharing
        try {
          await navigator.clipboard.writeText(imageUrl);
          toast.success('Opening Instagram! Image link copied for easy sharing! 📸', {
            duration: 4000,
            description: 'The image URL has been copied to your clipboard'
          });
        } catch (error) {
          toast.success('Opening Instagram! 📸', {
            duration: 3000,
            description: 'Copy the image link manually if needed'
          });
        }
      }
    },
    {
      name: 'Copy Image Link',
      icon: Copy,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      action: async () => {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
        try {
          await navigator.clipboard.writeText(imageUrl);
          toast.success('Image link copied! 🖼️', {
            duration: 3000,
            description: 'The direct image URL has been copied'
          });
        } catch (error) {
          // Fallback for older browsers
          if (typeof document === 'undefined') return;
          const textArea = document.createElement('textarea');
          textArea.value = imageUrl;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            document.execCommand('copy');
            toast.success('Image link copied! 🖼️');
          } catch (err) {
            toast.error('Failed to copy image link.');
          }
          document.body.removeChild(textArea);
        }
      }
    },
    {
      name: 'Copy Link',
      icon: Link,
      color: 'bg-slate-500 hover:bg-slate-600',
      action: () => copyToClipboard()
    }
  ];

  const copyToClipboard = async () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    const textToCopy = `${shareText}\n\n${shareUrl}`;
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        toast.success('Link and message copied to clipboard! 📋', {
          duration: 3000,
          description: 'You can now paste it anywhere!'
        });
      } else {
        // Fallback for older browsers or non-secure contexts
        if (typeof document === 'undefined') return;
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          toast.success('Link and message copied to clipboard! 📋');
        } else {
          throw new Error('Copy command failed');
        }
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard. Please copy the link manually.', {
        duration: 4000,
        description: 'Try using Ctrl+C after selecting the text'
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && navigator.canShare && navigator.canShare({ 
      title: 'Amazing Image Revealed! ✨',
      text: shareText,
      url: shareUrl 
    })) {
      try {
        await navigator.share({
          title: 'Amazing Image Revealed! ✨',
          text: shareText,
          url: shareUrl
        });
        toast.success('Shared successfully! 🚀');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.warn('Native share failed, falling back to copy:', error);
          copyToClipboard();
        }
        // AbortError means user cancelled, so we don't show an error
      }
    } else {
      // Fallback to copy if native share is not available
      copyToClipboard();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="w-full bg-gradient-to-r from-primary to-primary-glow"
          disabled={!isCompleted}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5 text-primary" />
              Share Your Discovery!
            </motion.div>
          </DialogTitle>
        </DialogHeader>
        
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Native Share & Download */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleNativeShare}
                variant="outline"
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {navigator.share ? 'Share' : 'Copy Link'}
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onDownload}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </motion.div>
          </div>

          {/* Social Media Platforms */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground text-center">
              Share on Social Media & More
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {shareOptions.map((platform, index) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={platform.action}
                    className={`w-full text-white ${platform.color} transition-all duration-200 text-xs`}
                    size="sm"
                  >
                    <platform.icon className="w-3 h-3 mr-1.5" />
                    {platform.name}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Copy Link Button */}
          <motion.div 
            className="pt-2 border-t"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={copyToClipboard}
              variant="ghost"
              className="w-full"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link & Message
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
