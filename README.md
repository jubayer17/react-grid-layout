# React Grid Layout Builder

A drag-and-drop form builder built with React and TypeScript. Create custom layouts with rows, columns, and form elements.

![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)

## Features

- Drag & drop interface with @hello-pangea/dnd
- Flexible grid system with rows and columns
- Multiple form field types (text, email, phone, name)
- Delete items by dragging to trash bin
- Auto-save to session storage
- Resizable columns
- Built with Vite for fast development

## Tech Stack

- React 19.2
- TypeScript
- Vite
- Tailwind CSS
- @hello-pangea/dnd

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

Clone and install:

```bash
git clone https://github.com/jubayer17/react-grid-layout.git
cd react-grid-layout
npm install
```

Run dev server:

```bash
npm run dev
```

Open `http://localhost:5173`

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview build
- `npm run lint` - Run ESLint

## Usage

1. Drag "Row" from sidebar to canvas
2. Drag "Column" into rows
3. Drag form fields into columns
4. Resize columns by dragging right edge
5. Delete by dragging to trash bin

## Available Components

- Row Container
- Column Container
- Text Field
- Image Placeholder
- Email Field
- Input Field
- Name Field
- Phone Field

## Customization

Tailwind CSS classes are in `src/components/`. Modify them to customize styling.

## Deployment

Deploy to Vercel, Netlify, or GitHub Pages.

Build command: `npm run build`  
Output directory: `dist`

## Project Structure

```
src/
├── components/     # React components
├── data/          # Types and initial data
├── App.tsx        # Main app
└── main.tsx       # Entry point
```

## Contributing

Feel free to open issues or PRs.

## License

MIT

## Author

jubayer17 - [@jubayer17](https://github.com/jubayer17)
