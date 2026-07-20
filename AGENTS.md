# Repository Guidelines

## Project Structure & Module Organization

This repository is a Vite-powered React 19 and TypeScript portfolio. Application entry points live in `src/main.tsx` and `src/App.tsx`. Keep page sections as focused components in `src/components/` (for example, `Hero.tsx` and `Works.tsx`), reusable browser behavior in `src/hooks/`, and site copy, SEO data, and section content in `src/constants/content.ts`. Shared styling is maintained in `src/styles/global.css`.

Publicly served images belong in `public/assets/` and should be referenced from the app as `/assets/<name>`. The top-level `assets/` directory contains source copies; update the public copy when an asset must be shipped.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies from `package-lock.json`.
- `npm run dev` starts the local Vite development server with hot reload.
- `npm run build` runs TypeScript project checks (`tsc -b`) and produces the production bundle in `dist/`.
- `npm run preview` serves the most recent production build for a final smoke test.

Run `npm run build` before opening a pull request. No automated unit-test or lint script is currently configured.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Follow the nearby file's formatting: two-space indentation, single-quoted strings, trailing commas in multiline values, and semicolons in component modules. Name component files and exported components in PascalCase (`ProgressBar.tsx`); name hooks `use<Feature>.ts` (`useClock.ts`); use camelCase for functions, props, and constants local to a module.

Keep user-facing copy and structured content in `src/constants/content.ts` instead of duplicating it across components. Preserve reduced-motion and touch-device behavior when changing animations, canvas rendering, or interactions.

## Testing Guidelines

Because there is no test framework yet, validate changes with `npm run build` and a manual browser check using `npm run dev`. Exercise desktop and mobile layouts, navigation anchors, loading behavior, and `prefers-reduced-motion` for animation changes. Add tests alongside new test infrastructure using descriptive names such as `Hero.test.tsx`.

## Commit & Pull Request Guidelines

Recent commits favor concise Conventional Commit-style subjects, often with Chinese summaries, such as `fix(mobile): 移动端响应式适配与体验优化` and `chore: 删除参考原型`. Prefer `feat(scope): summary`, `fix(scope): summary`, or `chore: summary` and keep each commit scoped to one concern.

Pull requests should explain the visible change, list validation performed, link relevant issues when available, and include before/after screenshots for layout, animation, or asset updates.
