@AGENTS.md

# Project conventions

## Styling
- Always use Tailwind utility classes instead of inline `style` props. Only keep inline styles when no Tailwind equivalent exists.
- Use the `text-(--color-NAME)` syntax for CSS custom properties in Tailwind classes, e.g. `text-(--color-beige)`. Never use the bracket-var form.
- Define animations, keyframes, and component-level CSS in `app/globals.scss`, not inline. Use Tailwind for everything else.
- SCSS component classes live inside `@layer components {}`.

## classnames utility
- Always use the `classnames` package (imported as `classNames`) for every `className` attribute — even static ones. Never use template literals or plain strings for `className`.

## Semantic HTML
- Use `<ul>`/`<li>` for any list of items (accordions, card grids, nav links, etc.).
- Never make a component a link (`<a>`) by default. Only add `href`/`<a>` when the user explicitly asks for it.

## Images
- Use `object-cover` + `w-full h-full` to fill a container. Use `object-contain` only when the full image must be visible with letterboxing.

## Components
- Keep data (arrays of objects) in a colocated `data.ts` file inside the view folder, not inside the component.
- Export a TypeScript interface alongside every data array.
- Do not add `href` to data interfaces unless the items are explicitly navigable links.
