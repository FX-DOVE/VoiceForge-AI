---
name: VoiceForge AI Core
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The design system for VoiceForge AI embodies a premium, futuristic aesthetic that positions the product at the intersection of high-end utility and cutting-edge technology. The visual narrative is built on **High-Fidelity Minimalism**, drawing inspiration from precision tools like Linear and the sophisticated depth of ElevenLabs.

The UI evokes an emotional response of "effortless power." It prioritizes clarity through generous whitespace, ultra-refined typography, and a deliberate use of depth. The interface utilizes a **Modern Glassmorphic** approach, where surfaces feel like precision-milled glass layered over a deep, infinite canvas. While the system supports both modes, the "Hero" state is a sophisticated dark theme that emphasizes the electric blue primary accents against deep charcoal depths.

## Colors
The palette is centered around **Electric Blue (#3B82F6)**, used as a high-contrast signal color for primary actions and brand presence. 

- **Dark Mode (Hero):** Uses a deep charcoal/black foundation (`#020617`). Surfaces are elevated using subtle tonal shifts and low-opacity white borders to define edges without adding visual weight.
- **Light Mode:** Uses a pure white base with soft gray (`#F8FAFC`) surfaces to maintain the same sense of airy premium quality.
- **Accents:** A secondary indigo is provided for data visualization or multi-voice differentiation, maintaining a cool-toned, futuristic spectrum.

## Typography
The system uses **Inter** for its clean, Swiss-inspired legibility and modern proportions. For technical or secondary metadata (like timestamps or voice parameters), **Geist** is utilized to provide a precise, developer-adjacent feel.

Hierarchy is achieved through dramatic scale and generous tracking. Display styles feature tight negative letter-spacing for a "locked-in" editorial look, while smaller labels use increased tracking (letter-spacing) to ensure readability and a premium "technical" aesthetic. Body text is set with comfortable line heights to handle long-form generated scripts.

## Layout & Spacing
The layout philosophy follows a **Fluid Grid** with fixed constraints for readability.
- **Grid:** A 12-column grid system is used for desktop, collapsing to 4 columns on mobile.
- **Rhythm:** Spacing follows a 4px baseline, but defaults to "Generous" increments (`24px` and `48px`) to prevent visual clutter and maintain the minimalist brand promise.
- **Margins:** Desktop views should utilize wide lateral margins (up to `80px`) to center focus on the text-to-speech canvas.
- **Reflow:** On mobile, padding reduces to `16px`, and cards stack vertically to ensure the voice selection and script editor remain the primary focus.

## Elevation & Depth
Depth is created through a combination of **Glassmorphism** and **Ambient Shadows**.

1.  **Surfaces:** Cards and modals use a semi-transparent background (e.g., `rgba(15, 23, 42, 0.7)`) with a `24px` backdrop-blur. 
2.  **Borders:** Every elevated element features a `1px` solid border. In dark mode, this is a low-opacity white (`rgba(255,255,255,0.08)`); in light mode, a soft grey.
3.  **Shadows:** Use large, ultra-soft shadows with 0% spread and very low opacity (5-10%). Shadows should feel like ambient occlusion rather than harsh light sources.
4.  **Z-Axis:**
    - Level 0: Background Canvas
    - Level 1: Content Cards / Sections (Subtle border, no shadow)
    - Level 2: Modals / Dropdowns (Backdrop-blur + Soft ambient shadow)

## Shapes
The shape language is defined by "Significant Softness." 
- **Standard Radius:** `16px` for small components like inputs and secondary buttons.
- **Large Radius:** `24px` for primary containers, large cards, and the main voice-generation dashboard.
- **Interactive States:** Buttons should feel tactile; use a slight scale-down effect (0.98) on click to reinforce the physical quality of the digital interface.

## Components
### Buttons
Primary buttons use a solid Electric Blue fill with white text. Secondary buttons use the glassmorphic style: a ghost background with a subtle border and high-blur backdrop.

### Inputs (Script Editor)
The main text input area should be "borderless" in appearance, defined only by the layout and a very subtle surface tint. Focus states are indicated by a glowing `2px` Electric Blue outer ring with a `4px` blur.

### Voice Chips
Interactive chips for selecting voices should use the `16px` radius. When active, they glow with a subtle primary-colored shadow.

### Progress & Audio Visualizers
Audio waveforms should be rendered in Electric Blue. Progress bars use a "pill" shape (`rounded-full`) and feature a subtle pulse animation when generating audio.

### Cards
Cards are the primary container. They must always feature the `24px` radius and a `1px` border. In the dark theme, a very subtle top-to-bottom linear gradient (lighter at the top) helps simulate a physical edge catching light.