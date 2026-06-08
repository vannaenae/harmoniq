# Song Library v2 Mockup

## Overall Design Principles
- **Style:** Flat Design, minimalist, clean lines, typography-focused.
- **Color Palette:** Utilizing the generated palette with professional blues, greens, and muted tones.
- **Typography:** Headings (h1, h2) in Cormorant Garamond, body text in Crimson Pro.
- **Interactions:** Simple hover effects (color/opacity shift), fast loading, clean transitions (150-200ms ease), no gradients/shadows on interactive elements.
- **Accessibility:** Ensure high contrast and clear focus states, maintain touch target sizes.

## Layout
- **Container:** Maintain `max-w-3xl mx-auto` for content.
- **Content Loading:** Ensure all dynamically loaded content (search results, song lists) has reserved space to prevent layout shifts.

## Components & Sections

### 1. Page Header
- **Title (`PageHeader`):** "Song library" - Font: `Cormorant Garamond`.
- **Subtitle (`PageHeader`):** "Find your next set" - Font: `Crimson Pro`.
- **Actions (Button):** "Add custom" button.
    - **Design:** Flat design. Use `var(--color-primary)` background with `var(--color-on-primary)` text. No `shadow-card`, no `shadow-card-hover`.

### 2. Search Input
- **Design:** Flat input field.
    - No shadows. Replace with a subtle `border border-harmonic-border`.
    - `Search` icon should be `var(--color-primary)` or `var(--color-foreground)`.
    - `placeholder` text: `Crimson Pro` in a muted tone (e.g., `text-harmonic-muted`).

### 3. Filters (Genre, Artist, Key, Sort)
- **Design:** `Select` components should have a flat appearance.
    - Subtle `border border-harmonic-border` for the select box.
    - Background: `var(--color-background)` or `var(--color-muted)`.
    - Text: `Crimson Pro`, `var(--color-foreground)` for selected value, `var(--color-muted)` for placeholder.
    - Dropdown options should also be flat, with clear hover states (e.g., `hover:bg-harmonic-muted/20`).

### 4. Filter Buttons (Offline only, Show archived)
- **Design:** Flat buttons.
    - Icons (`WifiOff`, `Archive`): `var(--color-primary)` or `var(--color-foreground)`.
    - Text: `Crimson Pro`, `var(--color-muted)` (default), `var(--color-foreground)` (on hover).
    - Hover state: subtle background color change (e.g., `hover:bg-harmonic-muted/10`) or text color change.

### 5. Your Library (Song List Items)
- **Card Design:** Flat card design.
    - Remove `shadow-card` and `hover:shadow-card`. Replace with `border border-harmonic-border` and a background color change on hover (e.g., `hover:bg-harmonic-muted/20`).
    - **Border Radius:** Increase `rounded-xl` for `AlbumArt` and the card itself to a value corresponding to `8px-12px`.
    - **AlbumArt:** Ensure a flat appearance, potentially with a `border border-harmonic-border` instead of shadows.
    - **Song Title/Artist:** `Crimson Pro`, `var(--color-foreground)` and `var(--color-muted)` respectively.
    - **Badges:** Flat design, using semantic colors from the new palette (e.g., `tone="muted"`, `tone="tertiary"`, `tone="primary"`, `tone="success"`). Solid background, no shadows.
    - **Chevron Icon:** `text-harmonic-muted`.

### 6. External Search Results (Apple Music, YouTube)

#### Section Headers
- **Text:** (e.g., "Apple Music", "YouTube") - `Cormorant Garamond`, `font-semibold uppercase tracking-widest text-harmonic-muted`.
- **Icons:** (`Music2`, `Youtube`) should use their respective brand colors (e.g., `#FA243C` for Apple Music, `#FF0000` for YouTube) but ensure they are vibrant and flat.

#### Loading Cards
- `SkeletonCard` or the `Card` with `Loader2` should conform to the new muted colors for loading.

#### Result Cards
- **Design:** Similar flat card design as the song list items (border, no shadow, background change on hover).
- **Album Art/Thumbnails:** Flat design with subtle borders.
- **Song Title/Artist/Duration/Channel:** `Crimson Pro`, `var(--color-foreground)` and `var(--color-muted)`.
- **Buttons (e.g., "Save", "Open in Apple Music", "See all on YouTube"):**
    - Flat design, conforming to `variant="primary"` or `variant="outlined"` rules.
    - `Heart` icon (when saved): `fill-current` with `var(--color-primary)`.
    - `Loader2` for saving state: `var(--color-primary)`.
    - `ExternalLink` icon: `text-harmonic-muted`.

### 7. Empty State
- **Design:** `EmptyState` component should follow the new typography and color scheme. The action button within `EmptyState` should also be Flat Design.

## Implementation Notes
- All hardcoded color values should be replaced with Tailwind CSS variables derived from the generated color palette.
- Review and update components in `src/components/ui` (`Card`, `Button`, `Badge`, `Input`, `Select`, `AlbumArt`, `PageHeader`) to ensure consistent Flat Design application.
- Update `tailwind.config.ts` if needed for new color variables, font families, or to define utility classes for the new design principles (e.g., `no-shadow`, `subtle-border`).
