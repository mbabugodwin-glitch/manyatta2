import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useFocusTrap, useBodyScroll, useEscapeKey } from '../hooks/useAccessibility';

interface StoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    date: string;
    image: string;
    content: string;
    author?: string;
}

const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose, title, date, image, content, author }) => {
    const modalRef = useFocusTrap(isOpen);
    useBodyScroll(isOpen);
    useEscapeKey(isOpen, onClose);
    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="story-modal-title"
                    aria-describedby="story-modal-content"
                    tabIndex={-1}
                >
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* Close Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-white text-dark rounded-full transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label="Close dialog"
                            title="Close (ESC)"
                        >
                            <X size={24} aria-hidden="true" />
                        </motion.button>

                        {/* Content */}
                        <div 
                            ref={contentRef}
                            id="story-modal-content"
                            className="max-h-[90vh] overflow-y-auto"
                            role="document"
                        >
                            {/* Hero Image */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="w-full h-80 overflow-hidden"
                                role="img"
                                aria-label={`${title} - featured image`}
                            >
                                <img src={image} alt={title} className="w-full h-full object-cover" />
                            </motion.div>

                            {/* Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-8 md:p-12"
                            >
                                <span className="text-xs font-bold text-primary uppercase tracking-wider mb-3 block" aria-label={`Published on ${date}`}>{date}</span>
                                <h1 
                                    id="story-modal-title"
                                    className="font-serif text-4xl md:text-5xl text-dark mb-4 leading-tight"
                                >
                                    {title}
                                </h1>
                                
                                {author && (
                                    <p className="text-sm text-gray-500 mb-8 italic">By {author}</p>
                                )}

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6"
                                >
                                    {content.split('\n\n').map((paragraph, idx) => (
                                        <p key={idx} className="text-lg">{paragraph}</p>
                                    ))}
                                </motion.div>

                                {/* Footer */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-12 pt-8 border-t border-gray-100"
                                >
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-3 bg-primary hover:bg-[#c4492e] text-white rounded-full font-medium transition-all"
                                    >
                                        Close
                                    </button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default StoryModal;
