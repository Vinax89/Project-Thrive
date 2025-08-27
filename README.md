# Project-Thrive

Financial management app built with React, TypeScript, Vite and Tailwind CSS.

## Getting Started

### Installation

Requires **Node.js 18+** and **npm 9+** (npm is included with Node.js). No other global tools are required.

```bash
npm install
```

### Development Workflow

Start a local development server:

```bash
npm run dev
```

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Testing and Linting

Run the unit tests with [Vitest](https://vitest.dev/):

```bash
npm test
```

Check code quality and formatting:

```bash
npm run lint
npm run format
```

## Project Structure

```
src/
  components/   Reusable React components
  logic/        Business logic and state management
  hooks/        Custom React hooks
  utils/        Utility helpers
  taxes/        Tax calculation modules
```

The project follows a modular design with functional React components and strict TypeScript typing. Styling is handled through Tailwind CSS, and formatting is enforced with Prettier.

## Contributing

1. Fork and clone the repository.
2. Create a branch for your feature or bug fix.
3. Run `npm test` and `npm run lint` before committing.
4. Open a pull request with a clear description of your changes.

## Reporting Issues

Use the GitHub issue tracker to report bugs or request features. Provide as much detail as possible, including steps to reproduce and screenshots where helpful.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
