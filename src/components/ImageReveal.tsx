import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Confetti } from './Confetti';
import { ShareDialog } from './ShareDialog';
import { useSounds } from '@/hooks/useSounds';
import { toast } from 'sonner';

interface ImageRevealProps {
  hiddenImageSrc: string;
  revealThreshold?: number;
  brushSize?: number;
  onRevealComplete?: () => void;
}

export const ImageReveal: React.FC<ImageRevealProps> = ({
  hiddenImageSrc,
  revealThreshold = 75,
  brushSize = 40,
  onRevealComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenImageRef = useRef<HTMLImageElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScratchTime, setLastScratchTime] = useState(0);
  
  const { playSound } = useSounds();

  // Initialize canvas and overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    if (!ctx || !overlayCtx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;
    
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    overlayCtx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Create gradient overlay
    const gradient = overlayCtx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
    gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.8)');
    gradient.addColorStop(1, 'rgba(59, 7, 100, 0.9)');
    
    overlayCtx.fillStyle = gradient;
    overlayCtx.fillRect(0, 0, rect.width, rect.height);
    
    // Add scratch instruction text
    overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    overlayCtx.font = 'bold 24px system-ui';
    overlayCtx.textAlign = 'center';
    overlayCtx.fillText('Scratch to reveal...', rect.width / 2, rect.height / 2);
    
    overlayCtx.font = '16px system-ui';
    overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    overlayCtx.fillText('✨ Swipe or scratch the surface ✨', rect.width / 2, rect.height / 2 + 40);
  }, [imageLoaded]);

  // Calculate reveal progress
  const calculateProgress = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return 0;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, overlayCanvas.width, overlayCanvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    let totalPixels = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparentPixels++;
    }

    return (transparentPixels / totalPixels) * 100;
  }, []);

  // Handle scratch/reveal interaction
  const handleReveal = useCallback((x: number, y: number) => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas || isCompleted) return;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    const rect = overlayCanvas.getBoundingClientRect();
    const scaleX = overlayCanvas.width / rect.width;
    const scaleY = overlayCanvas.height / rect.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x * scaleX, y * scaleY, brushSize * window.devicePixelRatio, 0, 2 * Math.PI);
    ctx.fill();

    // Play scratch sound (throttled)
    const now = Date.now();
    if (soundEnabled && now - lastScratchTime > 50) {
      playSound('scratch');
      setLastScratchTime(now);
    }

    // Update progress
    const progress = calculateProgress();
    setRevealProgress(progress);

    // Auto-reveal when threshold reached (Google Pay style)
    if (progress >= 50 && !isCompleted) {
      // Smooth auto-reveal animation
      const autoReveal = () => {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        
        const newProgress = calculateProgress();
        setRevealProgress(newProgress);
        
        if (newProgress < 95) {
          requestAnimationFrame(autoReveal);
        } else {
          setIsCompleted(true);
          setShowConfetti(true);
          if (soundEnabled) playSound('success');
          onRevealComplete?.();
          toast.success("🎉 Image revealed! Amazing discovery!");
          setTimeout(() => setShowConfetti(false), 3000);
        }
      };
      
      setTimeout(autoReveal, 100);
    }
  }, [brushSize, calculateProgress, revealThreshold, isCompleted, onRevealComplete, soundEnabled, lastScratchTime, playSound]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsRevealing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    handleReveal(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isRevealing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleReveal(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseUp = () => setIsRevealing(false);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsRevealing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    handleReveal(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isRevealing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    handleReveal(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsRevealing(false);
  };

  // Reset function
  const resetReveal = () => {
    setRevealProgress(0);
    setIsCompleted(false);
    setShowConfetti(false);
    
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;
    
    const rect = overlayCanvas.getBoundingClientRect();
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    // Recreate overlay
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
    gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.8)');
    gradient.addColorStop(1, 'rgba(59, 7, 100, 0.9)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to reveal...', rect.width / 2, rect.height / 2);
    
    ctx.font = '16px system-ui';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('✨ Swipe or scratch the surface ✨', rect.width / 2, rect.height / 2 + 40);
    
    toast.info("Ready for a new reveal! 🎯");
  };

  // Download functionality
  const downloadImage = () => {
    if (!isCompleted) {
      toast.error("Complete the reveal first! 🎨");
      return;
    }
    
    const link = document.createElement('a');
    link.download = 'revealed-image.png';
    link.href = hiddenImageSrc;
    link.click();
    toast.success("Image downloaded! 📥");
  };

  return (
    <motion.div 
      className="relative w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="relative overflow-hidden bg-card border-card-border hover-glow">
        {/* Hidden Image */}
        <img
          ref={hiddenImageRef}
          src={hiddenImageSrc}
          alt="Hidden reveal"
          className="w-full h-auto max-h-96 object-cover"
          onLoad={() => setImageLoaded(true)}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
        
        {/* Reveal Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
        
        {/* Overlay Canvas */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none"
          style={{ display: imageLoaded ? 'block' : 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* Loading State */}
        {!imageLoaded && (
          <div className="flex items-center justify-center h-96 bg-muted animate-pulse">
            <Sparkles className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        )}
      </Card>
      </motion.div>
      
      {/* Progress Bar */}
      <motion.div 
        className="mt-4 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Reveal Progress</span>
          <motion.span 
            className="text-gradient-primary font-medium"
            key={Math.round(revealProgress)}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {Math.round(revealProgress)}%
          </motion.span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-primary-glow"
            initial={{ width: 0 }}
            animate={{ width: `${revealProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </motion.div>
      
      {/* Action Buttons */}
      <motion.div 
        className="flex gap-3 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={resetReveal}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </motion.div>
        
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={downloadImage}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={!isCompleted}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </motion.div>
        
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <ShareDialog
            imageUrl={hiddenImageSrc}
            isCompleted={isCompleted}
            onDownload={downloadImage}
          />
        </motion.div>
        
        {/* Sound Toggle */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            size="sm"
            className="px-3"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </motion.div>
      </motion.div>
      
      {/* Completion Message */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div 
            className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h3 
                className="text-lg font-semibold text-gradient-primary mb-1"
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3 }}
              >
                🎉 Congratulations!
              </motion.h3>
              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4 }}
              >
                You've successfully revealed the hidden image!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};