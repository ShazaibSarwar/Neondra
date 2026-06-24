---
name: ui-ux-pro-max
description: Applies premium, state-of-the-art UI/UX design principles to the project. Use this when creating or updating UI components to ensure visual excellence and "Pro Max" quality.
---

# UI/UX Pro Max Guidelines

You have been invoked to apply "UI/UX Pro Max" aesthetics to this project. Your goal is to create web interfaces that are visually stunning, highly interactive, and extremely premium.

## 1. Visual Excellence & Aesthetics
- **Premium Color Palettes:** Avoid generic colors (plain red, blue, green). Use curated, harmonious color palettes (e.g., sleek dark modes, deep brand colors with subtle tints). Use CSS variables or Tailwind configured colors consistently.
- **Glassmorphism:** Use frosted glass effects (`backdrop-blur`, semi-transparent backgrounds with slight borders) for cards, dialogs, and floating elements.
- **Gradients:** Use smooth, multi-color gradients for backgrounds, active states, or text to add depth.
- **Typography:** Ensure a modern, readable font (e.g., Inter, Roboto, Outfit). Use clear hierarchy: bold, large headings and muted, highly legible body text.

## 2. Dynamic Design & Micro-animations
- **Hover & Active States:** Every interactive element (buttons, cards, links) MUST have a distinct, smooth hover state (`hover:scale-105`, `hover:shadow-lg`, brightness changes).
- **Transitions:** Use smooth transitions (`transition-all duration-200 ease-in-out`) on all changing properties.
- **Loading States:** Use skeletons (`<Skeleton />`) instead of generic spinners where possible to maintain layout structure during loading.
- **Feedback:** Provide immediate visual feedback for user actions (success toasts, subtle bounces on click).

## 3. Implementation Workflow
- Ensure proper use of the established design system (e.g., Shadcn UI components).
- Add Lucide icons to clarify meaning and add visual interest to buttons and labels.
- Do not build minimum viable products (MVPs). Build state-of-the-art interfaces.
- Ensure all layouts are fully responsive, with appropriate padding and gap scaling on smaller screens.

## 4. Specific Tailwind / CSS Techniques
- **Shadows & Depth:** Use soft, diffused shadows (`shadow-md`, `shadow-lg`, `shadow-[0_8px_30px_rgb(0,0,0,0.12)]`) rather than harsh borders.
- **Borders:** Use very subtle borders (`border-border/40` or `border-primary/20`) to define edges without adding visual noise.
- **Spacing:** Be generous with whitespace. Elements should have room to breathe. Use `space-y-4`, `gap-4`, `p-6`.

**Failure to meet these rich aesthetics is UNACCEPTABLE. Ensure every component you touch feels "Pro Max".**
