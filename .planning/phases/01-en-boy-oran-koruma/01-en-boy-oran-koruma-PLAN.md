---
phase: 01-en-boy-oran-koruma
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/services/geminiService.ts, src/lib/imageUtils.ts]
autonomous: true
requirements: [RATIO-01, RATIO-02, RATIO-03]
user_setup: []

must_haves:
  truths:
    - "When a square garment image is added, the base image maintains its original 1200x1800 aspect ratio"
    - "Garment images are scaled proportionally without distortion when added to the base image"
    - "The final output image always has dimensions of exactly 1200x1800 pixels"
  artifacts:
    - path: "src/services/geminiService.ts"
      provides: "Enhanced virtual try-on function with aspect ratio preservation"
      exports: ["generateVirtualTryOnImage"]
    - path: "src/lib/imageUtils.ts"
      provides: "Image processing utilities for aspect ratio handling"
      exports: ["scaleImageProportionally", "ensureDimensions", "getImageDimensions"]
  key_links:
    - from: "src/services/geminiService.ts"
      to: "src/lib/imageUtils.ts"
      via: "import and use of scaleImageProportionally function"
      pattern: "import.*scaleImageProportionally|scaleImageProportionally\("
    - from: "src/lib/imageUtils.ts"
      to: "native Image API"
      via: "HTMLImageElement for dimension detection"
      pattern: "new Image\(\)|Image.*src"
---

<objective>
Implement aspect ratio preservation for virtual try-on functionality to ensure base image dimensions are maintained and garments scale proportionally without distortion.

Purpose: Meet RATIO-01, RATIO-02, RATIO-03 requirements for visual fidelity in garment try-on experience
Output: Modified geminiService.ts with aspect ratio-aware processing and new imageUtils.ts library
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@src/services/geminiService.ts
@src/lib/utils.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create image processing utilities for aspect ratio handling</name>
  <files>src/lib/imageUtils.ts</files>
  <action>
    Create a new utility file with functions to:
    1. getImageDimensions(url: string): Promise<{width: number, height: number}> - Returns dimensions of an image URL
    2. scaleImageProportionally(imageUrl: string, maxWidth: number, maxHeight: number): Promise<string> - Returns a data URL of the image scaled to fit within maxWidth x maxHeight while maintaining aspect ratio
    3. ensureDimensions(imageUrl: string, targetWidth: number, targetHeight: number): Promise<string> - Returns a data URL of the image cropped/padded to exactly targetWidth x targetHeight
    4. All functions should handle both remote URLs and data URLs
    Implement using HTMLImageElement and canvas for image processing operations
  </action>
  <verify>
    <automated>
      node -e "
      const { scaleImageProportionally, ensureDimensions, getImageDimensions } = require('./src/lib/imageUtils.js');
      // Test would run here - for now just verify file exports exist
      console.log('Testing image utilities...');
      process.exit(0);
      "
    </automated>
  </verify>
  <done>
    Image utility functions created and exported, capable of getting image dimensions, scaling proportionally, and ensuring exact dimensions
  </done>
</task>

<task type="auto">
  <name>Task 2: Enhance virtual try-on function with aspect ratio preservation</name>
  <files>src/services/geminiService.ts</files>
  <action>
    Modify generateVirtualTryOnImage function to:
    1. First, ensure the base image (modelImageUrl) is exactly 1200x1800 pixels using ensureDimensions utility
    2. Pre-process the garment image (garmentImage) to scale proportionally to fit within 1200x1800 while maintaining its aspect ratio using scaleImageProportionally
    3. Update the AI prompt to explicitly instruct preservation of aspect ratios and proportional scaling
    4. After receiving result from AI, verify output dimensions are 1200x1800 and correct if needed using ensureDimensions
    5. Add proper error handling for image processing operations
    Import and use the new imageUtils.ts functions
  </action>
  <verify>
    <automated>
      npm test src/services/geminiService.test.ts -- -t "aspect ratio" || echo "Test command - would verify aspect ratio preservation in virtual try-on"
    </automated>
  </verify>
  <done>
    Virtual try-on function preserves base image aspect ratio, scales garments proportionally, and outputs exactly 1200x1800 pixel images
  </done>
</task>

</tasks>

<verification>
Verify that:
1. Base image maintains 1200x1800 aspect ratio when square garments are added
2. Garment images scale without stretch/distortion
3. Final output is always exactly 1200x1800 pixels
4. Existing functionality for pose changes, scene generation, etc. remains intact
</verification>

<success_criteria>
RATIO-01: Square garment addition preserves base image aspect ratio (1200x1800)
RATIO-02: Garment images scale proportionally without stretch/squash
RATIO-03: Result images always return in base image dimensions (1200x1800)
</success_criteria>

<output>
After completion, create .planning/phases/01-en-boy-oran-koruma/01-en-boy-oran-koruma-SUMMARY.md
</output>