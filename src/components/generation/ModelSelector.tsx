import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Check } from 'lucide-react';
import { ALL_MODELS, type ModelDefinition, type ModelFamily } from '../../config/model-catalog';

const ModelSelector = ({
    t,
    filteredFamilies,
    selectedFamilyId,
    handleFamilyChange,
    selectedModelId,
    setSelectedModelId,
    currentModel,
    cost,
    playClick,
    itemVariants
}: any) => {
    // Get models for current family
    const familyModels: ModelDefinition[] = filteredFamilies
        .find((f: ModelFamily) => f.id === selectedFamilyId)
        ?.models?.map((id: string) => ALL_MODELS[id])
        .filter(Boolean) || [];

    return (
        <motion.div variants={itemVariants} className="px-4 space-y-3">
            {/* Family Tabs (if multiple families visible) */}
            {filteredFamilies.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {filteredFamilies.map((family: ModelFamily) => (
                        <button
                            key={family.id}
                            onClick={() => handleFamilyChange(family.id)}
                            className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all border ${
                                selectedFamilyId === family.id
                                    ? 'bg-[#3390ec]/20 border-[#3390ec]/40 text-[#3390ec]'
                                    : 'bg-white/[0.03] border-white/5 text-gray-400 hover:text-white'
                            }`}
                        >
                            {family.icon} {family.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Model Cards — horizontal scroll */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                {familyModels.map((model: ModelDefinition) => {
                    const isSelected = selectedModelId === model.id;
                    return (
                        <button
                            key={model.id}
                            onClick={() => { setSelectedModelId(model.id); playClick(); }}
                            className={`relative flex-shrink-0 w-[130px] rounded-2xl p-3.5 text-left transition-all border ${
                                isSelected
                                    ? 'bg-[#3390ec]/10 border-[#3390ec]/40 shadow-lg shadow-[#3390ec]/10'
                                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                            }`}
                        >
                            {/* Selection checkmark */}
                            {isSelected && (
                                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#3390ec] flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                </div>
                            )}

                            {/* Icon */}
                            <div className="text-2xl mb-2">{model.icon}</div>

                            {/* Name */}
                            <p className={`text-[13px] font-bold leading-tight mb-1 ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                {model.shortName}
                            </p>

                            {/* Badge */}
                            {model.badge && (
                                <p className="text-[10px] text-gray-400 font-medium mb-2 leading-tight">
                                    {model.badge}
                                </p>
                            )}

                            {/* Price */}
                            <div className="flex items-center gap-1">
                                <Zap size={11} className="fill-amber-400 text-amber-400" />
                                <span className={`text-[12px] font-bold ${isSelected ? 'text-amber-300' : 'text-gray-400'}`}>
                                    {model.baseCost}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Active model description */}
            {currentModel && (
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{currentModel.icon}</span>
                            <div>
                                <p className="text-[13px] font-bold text-white">{currentModel.name}</p>
                                <p className="text-[11px] text-gray-400">{currentModel.provider}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full">
                            <Zap size={12} className="fill-amber-400 text-amber-400" />
                            <span className="text-[13px] font-bold text-amber-300">{cost}</span>
                        </div>
                    </div>
                    <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">{currentModel.description}</p>

                    {/* Capabilities badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {currentModel.capabilities?.map((cap: string) => (
                            <span
                                key={cap}
                                className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-gray-400 font-medium capitalize"
                            >
                                {cap.replace(/-/g, ' ')}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default React.memo(ModelSelector);
