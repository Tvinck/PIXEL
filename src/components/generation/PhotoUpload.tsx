import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Image as ImageIcon } from 'lucide-react';

const PhotoUpload = ({
    maxImagesForModel,
    selectedImages,
    previewUrls,
    handleRemoveImage,
    handleFileChange,
    t,
    itemVariants
}: any) => {
    if (maxImagesForModel <= 0) return null;

    return (
        <motion.div variants={itemVariants} className="px-4">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <ImageIcon size={16} className="text-[#3390ec]" />
                        <span className="text-[13px] font-bold text-white">
                            Исходное фото
                        </span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">
                        {selectedImages.length} / {maxImagesForModel}
                    </span>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                    {/* Existing previews */}
                    {previewUrls.map((url: string, idx: number) => (
                        <div
                            key={idx}
                            className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10 group"
                        >
                            <img
                                src={url}
                                alt={`Upload ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} className="text-white" />
                            </button>
                        </div>
                    ))}

                    {/* Add button */}
                    {selectedImages.length < maxImagesForModel && (
                        <label
                            htmlFor="file-upload"
                            className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-[#3390ec]/40 flex flex-col items-center justify-center cursor-pointer transition-colors group"
                        >
                            <Plus size={20} className="text-gray-500 group-hover:text-[#3390ec] transition-colors" />
                            <span className="text-[10px] text-gray-500 mt-1">Фото</span>
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default React.memo(PhotoUpload);
