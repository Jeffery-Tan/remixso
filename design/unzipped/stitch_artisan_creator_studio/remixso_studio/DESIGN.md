---
name: RemixSo Studio
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#4a4455'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#7b7487'
  outline-variant: '#ccc3d8'
  surface-tint: '#732ee4'
  primary: '#630ed4'
  on-primary: '#ffffff'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#d2bbff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#8700a1'
  on-tertiary: '#ffffff'
  tertiary-container: '#ad00ce'
  on-tertiary-container: '#ffdaff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#fed6ff'
  tertiary-fixed-dim: '#f6adff'
  on-tertiary-fixed: '#350040'
  on-tertiary-fixed-variant: '#7a0092'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Epilogue
    fontSize: 84px
    fontWeight: '800'
    lineHeight: 90px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: 0.05em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.15em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin: 48px
  container-max: 1440px
---

## Brand & Style

This design system is built upon an **Editorial Avant-Garde** aesthetic, merging the high-contrast authority of a fashion magazine with the fluid, luminous nature of modern digital creation tools. It targets content creators who view their work as an art form, demanding an environment that feels like a premium, high-end digital studio.

The visual narrative is driven by three core pillars:
1.  **Dramatic Typography:** Type is not just content; it is a structural element of the layout. Large scales and wide tracking create a sense of architectural space.
2.  **Glass & Light:** Depth is achieved through glassmorphism and soft, glowing mesh gradients rather than traditional shadows, evoking a sense of "digital alchemy."
3.  **Precision Minimalism:** Thin, 1px geometric borders and a restricted palette ensure the interface remains sophisticated and professional, preventing the vibrant accents from becoming overwhelming.

The emotional response should be one of curated inspiration—a space where the UI recedes to let the user's creativity feel "magic" and premium.

## Colors

The palette is anchored by **Electric Purple**, used sparingly but with high impact to denote action and "magic" moments. This is balanced against a high-contrast foundation of **Deep Ink Black** and **Crisp Paper Whites**.

- **Primary:** Electric Purple (#7C3AED) for primary calls to action and active states.
- **Secondary:** Deep Ink Black (#0F172A) for headers, body text, and structural strokes to maintain a grounded, premium feel.
- **Surface:** A mix of pure white (#FFFFFF) for content areas and subtle grey-to-lavender gradients for background depth.
- **Accents:** Neon Violet and soft lavender gradients are utilized for mesh backgrounds and glassmorphic highlights, creating a "glow" effect behind frosted overlays.

## Typography

This design system employs a high-contrast typographic hierarchy to mirror editorial layouts. 

- **Headlines:** Uses **Epilogue** for its geometric yet expressive character. Large-scale headlines (XL/LG) should use tight tracking to feel cohesive, while medium-sized headers (MD) used as section breaks should use dramatic wide tracking to evoke a "gallery" aesthetic.
- **Body:** Uses **Inter** for maximum legibility in complex tool interfaces. It provides a neutral, functional counterpoint to the expressive headlines.
- **Labels:** Small labels and metadata should always be uppercase with increased letter spacing to maintain the "high-end studio" feel.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid** model. Content is housed within a 12-column grid with generous margins (48px+) to create "white space as luxury."

- **Rhythm:** A 4px baseline grid ensures tight alignment of technical elements.
- **Composition:** Asymmetric layouts are encouraged. Large typographic elements should often bleed into margins or overlap with glassmorphic cards to create visual interest.
- **Gaps:** Use wide gutters (24px) to ensure that even dense creator tools feel breathable and organized.

## Elevation & Depth

Depth is not communicated through traditional drop shadows but through **optical layering and translucency**:

- **Glassmorphism:** Overlays, sidebars, and floating panels utilize a backdrop blur (20px to 40px) with a semi-transparent white or lavender-tinted fill (10-15% opacity).
- **Luminescent Borders:** Elements are defined by 1px or 0.5px "inner-glow" borders. These should be slightly lighter than the background or a very faint purple tint to simulate light catching the edge of glass.
- **Mesh Gradients:** Subtle, animated mesh gradients should be placed behind glass layers to create a sense of movement and "active creativity."
- **Z-Axis:** Use three distinct tiers:
    1. Base (Paper white or textured grey).
    2. Mid (Floating glass cards).
    3. Top (Active modals or tooltips with high-contrast Ink Black backgrounds).

## Shapes

To maintain an architectural and professional feel, the design system utilizes **subtle roundedness**.

- **Standard Elements:** 4px (Soft) for buttons and input fields.
- **Large Containers:** 8px for cards and glassmorphic panels.
- **Icons:** Sharp geometric edges, accented with the ✦ (magic sparkle) shape for feature highlights or AI-driven capabilities.
- **Structural Lines:** Use 0.5px vertical and horizontal dividers in Deep Ink Black (at 10% opacity) to create a sense of a structured design grid.

## Components

### Buttons
- **Primary:** Solid Electric Purple with white text. 4px corner radius. No shadow, but a subtle violet outer glow on hover.
- **Secondary:** Deep Ink Black with white text for a bold, authoritative look.
- **Ghost:** 1px Black or Purple border with transparent background.

### Cards
- **Glass Card:** Semi-transparent white background, 20px backdrop blur, 1px subtle white border, 8px radius. 
- **Editorial Card:** Solid white, 1px Deep Ink Black border, no shadow. Used for high-density information.

### Form Inputs
- **Style:** Minimalist bottom-border only or very thin 1px full border. Focus state triggers an Electric Purple border and a faint lavender background glow.
- **Labels:** Always use the `label-caps` typography style.

### Decorative Elements
- **Magic Sparkles:** The ✦ glyph is used as a prefix for premium features or "Remix" actions.
- **Textures:** Subtle "paper grain" or "noise" overlays on large background areas to reduce digital sterility and add a tactile feel.

### Navigation
- **Sidebar:** Full-height glassmorphic panel with blurred background. Active links are indicated by a 2px vertical Electric Purple line on the far left and bold typography.