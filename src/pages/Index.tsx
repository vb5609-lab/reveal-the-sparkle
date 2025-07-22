import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageReveal } from '@/components/ImageReveal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AdminPanel } from '@/components/AdminPanel';
import { Sparkles } from 'lucide-react';
import hiddenTreasure from '@/assets/hidden-treasure.jpg';

const Index = () => {
  const [currentImage, setCurrentImage] = useState(hiddenTreasure);
  const [revealSettings, setRevealSettings] = useState({
    brushSize: 40,
    revealThreshold: 75
  });

  const handleRevealComplete = () => {
    console.log('🎉 Image fully revealed!');
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Theme Toggle */}
      <motion.div 
        className="absolute top-4 left-4 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <ThemeToggle />
      </motion.div>
      
      {/* Admin Panel */}
      <AdminPanel
        onImageChange={setCurrentImage}
        onSettingsChange={setRevealSettings}
        currentSettings={revealSettings}
      />
      
      {/* Streamlined Header */}
      <motion.div 
        className="relative overflow-hidden pt-16 pb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 text-center relative">
        
          
          
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-4 text-gradient-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Scratch & Reveal
          </motion.h1>
          
          <motion.p 
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Scratch to discover hidden treasures with satisfying sounds and smooth animations!
          </motion.p>
        </div>
      </motion.div>
      
      {/* Main Reveal Area - Core Content */}
      <motion.div 
        className="container mx-auto px-4 pb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <div className="max-w-3xl mx-auto">
          <ImageReveal
            hiddenImageSrc={currentImage}
            revealThreshold={revealSettings.revealThreshold}
            brushSize={revealSettings.brushSize}
            onRevealComplete={handleRevealComplete}
          />
        </div>
      </motion.div>
      
      {/* Optional Comment Section */}
      <motion.div 
        className="container mx-auto px-4 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        
      </motion.div>
    </div>
  );
};

export default Index;
