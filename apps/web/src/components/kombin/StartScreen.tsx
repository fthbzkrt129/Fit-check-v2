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

const StartScreen: React.FC<StartScreenProps> = ({ onExperimentalStyling }) => {
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
          className="start-screen start-screen--result"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="start-screen__result-copy">
            <div className="start-screen__result-heading">
              <p className="start-screen__label">Generated model</p>
              <h1 className="start-screen__title start-screen__title--result">
                The New You
              </h1>
              <p className="start-screen__lead start-screen__lead--result">
                Drag the slider to see your transformation.
              </p>
            </div>
            
            {isGenerating && (
              <div className="start-screen__status">
                <Spinner />
                <span>Generating your model...</span>
              </div>
            )}

            {error && 
              <div className="start-screen__error-card">
                <p className="start-screen__error-title">Generation Failed</p>
                <p>{error}</p>
                <button onClick={reset} className="start-screen__link-button">Try Again</button>
              </div>
            }
            
            <div data-testid="start-screen-actions" className="start-screen__result-actions">
              <AnimatePresence>
                {generatedModelUrl && !isGenerating && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5 }}
                    className="start-screen__action-grid"
                  >
                    <button
                      onClick={() => onExperimentalStyling(generatedModelUrl)}
                      className="start-screen__action start-screen__action--primary"
                    >
                      Start Styling
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="start-screen__result-visual">
            <div
              data-testid="start-screen-preview-shell"
              className="start-screen__preview-shell"
            >
              <Compare
                firstImage={userImageUrl}
                secondImage={generatedModelUrl ?? userImageUrl}
                slideMode="drag"
                className="start-screen__compare start-screen__compare--result"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartScreen;
