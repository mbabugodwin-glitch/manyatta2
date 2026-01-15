import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause, Loader2 } from 'lucide-react';
import { useFocusTrap, useBodyScroll, useEscapeKey } from '../hooks/useAccessibility';

interface ImageSlideshowModalProps {
    images: string[];
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

interface ImageLoadState {
    [key: number]: boolean;
}

const SWIPE_THRESHOLD = 50; // Minimum swipe distance in pixels

const ImageSlideshowModal: React.FC<ImageSlideshowModalProps> = ({ images, isOpen, onClose, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(false);
    const [imageLoadStates, setImageLoadStates] = useState<ImageLoadState>({});
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchEndX, setTouchEndX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    
    const imageRefs = useRef<HTMLImageElement[]>([]);
    const touchStartTime = useRef<number>(0);
    
    // Accessibility hooks
    const modalRef = useFocusTrap(isOpen);
    useBodyScroll(isOpen);
    useEscapeKey(isOpen, onClose);

    // Handle image load
    const handleImageLoad = useCallback((index: number) => {
        setImageLoadStates(prev => ({
            ...prev,
            [index]: true
        }));
    }, []);

    // Handle image error
    const handleImageError = useCallback((index: number) => {
        console.error(`Failed to load image at index ${index}: ${images[index]}`);
        setImageLoadStates(prev => ({
            ...prev,
            [index]: false
        }));
    }, [images]);

    // Preload adjacent images with optimized concurrent loading
    useEffect(() => {
        const preloadImage = (index: number) => {
            if (imageLoadStates[index] !== undefined) return; // Skip if already loaded or attempted
            
            const img = new Image();
            img.loading = 'eager';
            img.src = images[index];
            img.onload = () => handleImageLoad(index);
            img.onerror = () => handleImageError(index);
        };

        // Preload current image first (priority)
        preloadImage(currentIndex);
        
        // Then preload adjacent images with slight delay to avoid network congestion
        const timer = setTimeout(() => {
            // Preload next image
            if (currentIndex < images.length - 1) {
                preloadImage(currentIndex + 1);
            }
            
            // Preload previous image
            if (currentIndex > 0) {
                preloadImage(currentIndex - 1);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [currentIndex, images, handleImageLoad, handleImageError, imageLoadStates]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setImageLoadStates({});
            setSwipeOffset(0);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') {
                e.preventDefault();
                setIsAutoPlay(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, images.length]);

    // Autoplay effect
    useEffect(() => {
        if (!isAutoPlay || !isOpen) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 4000);

        return () => clearInterval(timer);
    }, [isAutoPlay, isOpen, images.length]);

    // Navigation functions
    const nextImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setSwipeOffset(0);
    }, [images.length]);

    const prevImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setSwipeOffset(0);
    }, [images.length]);

    // Enhanced touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
        touchStartTime.current = Date.now();
        setIsSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwiping) return;
        
        const currentX = e.touches[0].clientX;
        const diff = touchStartX - currentX;
        setSwipeOffset(diff);
        
        // Prevent scrolling while swiping
        if (Math.abs(diff) > 10) {
            e.preventDefault();
        }
    };

    const handleTouchEnd = () => {
        setIsSwiping(false);
        const swipeDistance = touchStartX - touchEndX;
        const swipeDuration = Date.now() - touchStartTime.current;
        const swipeVelocity = Math.abs(swipeDistance) / swipeDuration;
        
        // Reset swipe offset with animation
        setSwipeOffset(0);
        
        // Determine if it's a valid swipe
        if (Math.abs(swipeDistance) > SWIPE_THRESHOLD || swipeVelocity > 0.3) {
            if (swipeDistance > 0) {
                // Swipe left -> next image
                nextImage();
            } else {
                // Swipe right -> previous image
                prevImage();
            }
        }
    };

    const handleTouchCancel = () => {
        setIsSwiping(false);
        setSwipeOffset(0);
    };

    // Update touch end position
    useEffect(() => {
        if (!isSwiping && swipeOffset !== 0) {
            setSwipeOffset(0);
        }
    }, [isSwiping, swipeOffset]);

    if (!isOpen) return null;

    const currentImageLoaded = imageLoadStates[currentIndex] === true;

    return (
        <AnimatePresence>
            <motion.div
                ref={modalRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-sm p-4"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-label={`Image gallery: ${title || 'Gallery'}`}
                tabIndex={-1}
            >
                {/* Close Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-3 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                    title="Close (ESC)"
                    aria-label="Close gallery"
                >
                    <X size={28} />
                </motion.button>

                {/* Main Content */}
                <div 
                    className="relative w-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center" 
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchCancel}
                >
                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.1, x: -4 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={prevImage}
                                className="absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white hidden md:flex"
                                title="Previous (←)"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={28} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1, x: 4 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={nextImage}
                                className="absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white hidden md:flex"
                                title="Next (→)"
                                aria-label="Next image"
                            >
                                <ChevronRight size={28} />
                            </motion.button>
                        </>
                    )}

                    {/* Image Container */}
                    <div className="w-full h-full overflow-hidden flex flex-col items-center justify-center relative">
                        {/* Swipe Indicator */}
                        {isSwiping && Math.abs(swipeOffset) > 10 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute top-4 z-10 flex items-center gap-2 text-white/70 text-sm"
                            >
                                <div className={`transform ${swipeOffset > 0 ? '' : 'rotate-180'}`}>
                                    <ChevronRight size={20} />
                                </div>
                                <span>Swipe to {swipeOffset > 0 ? 'next' : 'previous'}</span>
                            </motion.div>
                        )}

                        {/* Main Image with Loading State */}
                        <div className="relative max-h-[75vh] w-full flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ 
                                        opacity: 0,
                                        x: swipeOffset > 0 ? 100 : swipeOffset < 0 ? -100 : 0 
                                    }}
                                    animate={{ 
                                        opacity: currentImageLoaded ? 1 : 0.5,
                                        x: isSwiping ? swipeOffset : 0
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{ 
                                        duration: isSwiping ? 0 : 0.3,
                                        ease: "easeInOut" 
                                    }}
                                    className="relative max-h-[75vh] w-auto max-w-full flex items-center justify-center"
                                >
                                    {/* Loading Overlay */}
                                    {!currentImageLoaded && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/30"
                                        >
                                            <Loader2 className="w-12 h-12 text-white/70 animate-spin" />
                                        </motion.div>
                                    )}

                                    {/* Actual Image */}
                                    <img
                                        ref={el => {
                                            if (el) imageRefs.current[currentIndex] = el;
                                        }}
                                        src={images[currentIndex]}
                                        alt={`${title || 'Gallery'} - Image ${currentIndex + 1}`}
                                        loading={currentIndex === 0 ? "eager" : "lazy"}
                                        decoding="async"
                                        className={`max-h-[75vh] w-auto max-w-full object-contain shadow-2xl rounded-lg transition-opacity duration-300 ${
                                            currentImageLoaded ? 'opacity-100' : 'opacity-0'
                                        }`}
                                        onLoad={() => handleImageLoad(currentIndex)}
                                        onError={() => handleImageError(currentIndex)}
                                        style={{
                                            cursor: isSwiping ? 'grabbing' : 'grab',
                                            transform: `translateX(${isSwiping ? swipeOffset : 0}px)`,
                                            transition: isSwiping ? 'none' : 'transform 0.3s ease'
                                        }}
                                    />

                                    {/* Image Info Badge */}
                                    {currentImageLoaded && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-white/80"
                                        >
                                            {currentIndex + 1} of {images.length}
                                        </motion.div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Title */}
                        {title && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-4 text-center"
                            >
                                <h3 className="text-xl font-medium text-white">{title}</h3>
                            </motion.div>
                        )}

                        {/* Progress and Controls */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-6 w-full max-w-md space-y-4"
                        >
                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                />
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between px-2">
                                {/* Dot Indicators */}
                                <div className="flex gap-1.5">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`rounded-full transition-all duration-300 ${
                                                idx === currentIndex 
                                                    ? 'w-8 h-2 bg-white' 
                                                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                                            }`}
                                            aria-label={`Go to image ${idx + 1}`}
                                        />
                                    ))}
                                </div>

                                {/* Autoplay Toggle */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        isAutoPlay
                                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                >
                                    {isAutoPlay ? (
                                        <>
                                            <Pause size={16} />
                                            Pause
                                        </>
                                    ) : (
                                        <>
                                            <Play size={16} />
                                            Autoplay
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Mobile Navigation (touch only) */}
                        {images.length > 1 && (
                            <div className="md:hidden mt-4 flex items-center justify-center gap-6">
                                <button
                                    onClick={prevImage}
                                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                
                                <span className="text-white/70 text-sm">
                                    {currentIndex + 1} / {images.length}
                                </span>
                                
                                <button
                                    onClick={nextImage}
                                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/40 text-xs font-light flex flex-col items-center gap-1"
                    >
                        <div className="hidden md:flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-white/10 rounded">← →</kbd>
                            <span>Navigate</span>
                            <kbd className="px-2 py-1 bg-white/10 rounded ml-2">Space</kbd>
                            <span>Autoplay</span>
                            <kbd className="px-2 py-1 bg-white/10 rounded ml-2">ESC</kbd>
                            <span>Close</span>
                        </div>
                        <div className="md:hidden text-center">
                            Swipe or tap arrows to navigate
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ImageSlideshowModal;