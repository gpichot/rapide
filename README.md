# A collection of templates for Rapid Project Development

This repository contains various templates that I use to set up TypeScript
projects with an opiniated approach.

## Templates

| Template        | Description                                | Usage                                          |
| --------------- | ------------------------------------------ | ---------------------------------------------- |
| `react`         | Basic React                                | `degit gpichot/rapide/templates/react`         |
| `tsoa`          | Express Server with Tsoa + Prisma          | `degit gpichot/rapide/templates/tsoa`          |
| `web-extension` | Web Extension (Polyfill, crxjs/vite-plugin | `degit gpichot/rapide/templates/web-extension` |

## Status

I maintain this repository for now, feel free to fill issues or to open PR.
Feedback is welcome.

## What's inside?

All templates includes:

- 📦 Vite
- 🃏 Jest
- 📝 Prettier
- 🚫 ESLint (with plugin simple-import-sort)
- 📦 Yarn
- 🧰 TypeScript (+ typed-scss-modules for the front)
- 🖋️ Commitlint
- 🐾 Husky

On the frontend side:

- ⚛️ React
- ✅ Testing Library (user-event, react-hook, jest-dom)
- 🎨 Sass, CSS Modules (typed)
- 🥷 Storybook + Testing React

On the backend side:

- Express
- TSOA for the swagger template
- Prisma for SQL database

## TODO

- [ ] Cypress
