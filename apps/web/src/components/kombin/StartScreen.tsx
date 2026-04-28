/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon } from './icons';
import { Compare } from './ui/compare';
import { generateModelImage } from '@/lib/kombin/services/geminiService';
import Spinner from './Spinner';
import { getFriendlyErrorMessage } from '@/lib/kombin/utils';
const heroImage = '/kombin-hero.png';
const editedHeroImage = '/kombin-hero-edited.png';

interface StartScreenProps {
  onExperimentalStyling: (modelUrl: string) => void;
  onModelFinalized: (modelUrl: string, target?: 'styling' | 'modelSwap') => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onModelFinalized, onExperimentalStyling }) => {
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setUserImageUrl(dataUrl);
        setIsGenerating(true);
        setGeneratedModelUrl(null);
        setError(null);
        try {
            const result = await generateModelImage(file);
            setGeneratedModelUrl(result);
        } catch (err) {
            setError(getFriendlyErrorMessage(err, 'Failed to create model'));
            setUserImageUrl(null);
        } finally {
            setIsGenerating(false);
        }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const reset = () => {
    setUserImageUrl(null);
    setGeneratedModelUrl(null);
    setIsGenerating(false);
    setError(null);
  };

  const screenVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <AnimatePresence mode="wait">
      {!userImageUrl ? (
        <motion.div
          key="uploader"
          className="start-screen"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="start-screen__copy">
            <div className="start-screen__copy-inner">
              <h1 className="start-screen__title">
                Create Your Model for Any Look.
              </h1>
              <p className="start-screen__lead">
                Ever wondered how an outfit would look on you? Stop guessing. Upload a photo and see for yourself. Our AI creates your personal model, ready to try on anything.
              </p>
              <hr className="start-screen__rule" />
               <div className="start-screen__actions">
                 <label htmlFor="image-upload-start" className="start-screen__upload" style={{
                    boxShadow: 'rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px'
                  }}>
                    <UploadCloudIcon className="start-screen__upload-icon" />
                    Upload Photo
                  </label>
                  <input id="image-upload-start" type="file" className="start-screen__file" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} />
                 <p className="start-screen__hint">Select a clear, full-body photo. Face-only photos also work, but full-body is preferred for best results.</p>
                 <p className="start-screen__terms">By uploading, you agree not to create harmful, explicit, or unlawful content. This service is for creative and responsible use only.</p>
                 {error && <p className="start-screen__error">{error}</p>}
              </div>
            </div>
          </div>
          <div className="start-screen__visual">
            <Compare
              firstImage={heroImage}
              secondImage={editedHeroImage}
              slideMode="drag"
              className="start-screen__compare"
            />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="compare"
          className="w-full max-w-6xl mx-auto h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="md:w-1/2 flex-shrink-0 flex flex-col items-center md:items-start">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                The New You
              </h1>
              <p className="mt-2 text-md text-gray-600">
                Drag the slider to see your transformation.
              </p>
            </div>
            
            {isGenerating && (
              <div className="flex items-center gap-3 text-lg text-gray-700 font-serif mt-6">
                <Spinner />
                <span>Generating your model...</span>
              </div>
            )}

            {error && 
              <div className="text-center md:text-left text-red-600 max-w-md mt-6">
                <p className="font-semibold">Generation Failed</p>
                <p className="text-sm mb-4">{error}</p>
                <button onClick={reset} className="text-sm font-semibold text-gray-700 hover:underline">Try Again</button>
              </div>
            }
            
            <div data-testid="start-screen-actions" className="mt-8 min-h-[15rem] w-full">
              <AnimatePresence>
                {generatedModelUrl && !isGenerating && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-center gap-4 w-full"
                  >
                   {/* Proceed to Styling - Primary Dark Button */}
                    <button
                      onClick={() => onModelFinalized(generatedModelUrl, 'styling')}
                      className="w-full sm:w-auto relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-[#fcfbf8] bg-[#1c1c1c] rounded-md cursor-pointer transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:shadow-lg"
                      style={{
                        boxShadow: 'rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px'
                      }}
                    >
                      Proceed to Styling →
                    </button>
                    
                    {/* Deneysel kombin giydir - Ghost Button */}
                    <button
                      onClick={() => onExperimentalStyling(generatedModelUrl)}
                      className="w-full sm:w-auto relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-[#1c1c1c] bg-transparent border border-[rgba(28,28,28,0.4)] rounded-md cursor-pointer transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:shadow-lg"
                    >
                      Deneysel kombin giydir
                    </button>
                    
                    {/* Manken Değiştir - Cream Surface Button */}
                    <button
                      onClick={() => onModelFinalized(generatedModelUrl, 'modelSwap')}
                      className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-[#1c1c1c] bg-[#f7f4ed] rounded-md cursor-pointer border border-[#eceae4] transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:shadow-lg"
                    >
                      Manken Değiştir
                    </button>

                    {/* Use Different Photo - Secondary Action */}
                    <button 
                      onClick={reset}
                      className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-[#1c1c1c] bg-transparent border border-[#eceae4] rounded-md cursor-pointer transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:shadow-lg"
                    >
                      Use Different Photo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="md:w-1/2 w-full flex items-center justify-center">
            <div
              data-testid="start-screen-preview-shell"
              className={`relative rounded-[1.25rem] transition-all duration-300 ease-out ${isGenerating ? 'border border-gray-300 shadow-[0_12px_32px_rgba(15,23,42,0.08)]' : 'border border-transparent'}`}
            >
              <Compare
                firstImage={userImageUrl}
                secondImage={generatedModelUrl ?? userImageUrl}
                slideMode="drag"
                className="w-[280px] h-[420px] sm:w-[320px] sm:h-[480px] lg:w-[400px] lg:h-[600px] rounded-2xl bg-gray-200"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartScreen;
