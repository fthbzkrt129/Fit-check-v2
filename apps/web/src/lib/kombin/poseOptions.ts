export interface PoseOption {
  label: string;
  instruction: string;
}

export const POSE_OPTIONS: PoseOption[] = [
  {
    label: 'Front Hands on Hips',
    instruction: 'Full frontal view, hands on hips',
  },
  {
    label: 'Three-Quarter Turn',
    instruction: 'Slightly turned, 3/4 view',
  },
  {
    label: 'Side Profile',
    instruction: 'Side profile view',
  },
  {
    label: 'Mid-Air Jump',
    instruction: 'Jumping in the air, mid-action shot',
  },
  {
    label: 'Walk Forward',
    instruction: 'Walking towards camera',
  },
  {
    label: 'Lean Pose',
    instruction: 'Leaning against a wall',
  },
  {
    label: 'Low-Angle Editorial',
    instruction: 'full-body fashion editorial shot, model standing with a strong balanced posture, legs slightly apart, hands in pockets, shoulders relaxed, low-angle camera perspective, product clear and readable, garment fit preserved, clean fabric surface, trouser hem preserved, editorial fashion look, premium minimal interior, soft natural window light, minimal background, product in focus',
  },
  {
    label: 'Close-Up Lower',
    instruction: 'close-up fashion framing focused on the lower half of the outfit, model standing naturally, lower body and garment details clearly visible, crop from waist to feet, clean studio or minimal background, product fit and texture preserved, balanced composition, soft natural light, premium look',
  },
  {
    label: 'Close-Up Upper',
    instruction: 'close-up fashion framing focused on the upper half of the outfit, crop from head to waist, shoulders, neckline, and upper garment details clearly visible, model standing naturally, clean studio or minimal background, product fit and texture preserved, balanced composition, soft natural light, premium look',
  },
];
