import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2 } from 'lucide-react';

interface ImpactReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    image: string;
    reportContent: string;
    year?: string;
    impact?: { label: string; value: string }[];
}

const ImpactReportModal: React.FC<ImpactReportModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    image,
    reportContent,
    year,
    impact
}) => {
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* Close Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-white text-dark rounded-full transition-colors shadow-md"
                        >
                            <X size={24} />
                        </motion.button>

                        {/* Content */}
                        <div className="max-h-[90vh] overflow-y-auto">
                            {/* Hero Image */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="w-full h-80 overflow-hidden"
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
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div>
                                        <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">
                                            {year ? `Impact Report ${year}` : 'Impact Report'}
                                        </span>
                                        <h1 className="font-serif text-4xl md:text-5xl text-dark leading-tight">{title}</h1>
                                    </div>
                                </div>

                                <p className="text-lg text-gray-700 leading-relaxed mb-8">{description}</p>

                                {/* Impact Metrics */}
                                {impact && impact.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl"
                                    >
                                        {impact.map((item, idx) => (
                                            <div key={idx} className="text-center">
                                                <div className="font-serif text-2xl md:text-3xl text-primary font-bold mb-1">{item.value}</div>
                                                <div className="text-xs text-gray-600 uppercase tracking-wide">{item.label}</div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Report Content */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6 mb-8"
                                >
                                    {reportContent.split('\n\n').map((paragraph, idx) => (
                                        <p key={idx} className="text-base">{paragraph}</p>
                                    ))}
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-[#c4492e] text-white rounded-full font-medium transition-all"
                                    >
                                        <Download size={18} />
                                        Download PDF
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-2 px-6 py-3 border border-primary text-primary hover:bg-primary/10 rounded-full font-medium transition-all"
                                    >
                                        <Share2 size={18} />
                                        Share
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onClose}
                                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-dark rounded-full font-medium transition-all"
                                    >
                                        Close
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ImpactReportModal;
