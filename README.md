# React + Vite

## Node version

Vite requires Node `22.12+` (or `20.19+`). This repo pins Node `22.12.0` via `.nvmrc`/`.node-version` and `package.json#engines`.

- If you use `nvm`: `nvm install && nvm use`
- If you use Homebrew: install `node@22` and ensure it is first on your `PATH`.

## Run full app (client + server)

Login/Signup requires the backend in `server/`.

- Start both client and server:
	- `npm run dev:full`
- Or start them separately:
	- Client: `npm run dev`
	- Server: `npm --prefix server run dev`

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
