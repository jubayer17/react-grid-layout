# React Grid Layout Builder

A powerful and intuitive drag-and-drop form builder built with React and TypeScript. Create dynamic layouts with rows, columns, and form elements through a simple drag-and-drop interface.

![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)

## ✨ Features

- 🎯 **Drag & Drop Interface** - Intuitive drag-and-drop functionality powered by @hello-pangea/dnd
- 📐 **Flexible Grid System** - Create custom layouts with rows and columns
- 📝 **Form Elements** - Multiple input types including text, email, phone, and name fields
- 🗑️ **Delete Functionality** - Easy deletion with drag-to-trash feature
- 💾 **Session Persistence** - Automatically saves your layout to session storage
- 🎨 **Resizable Columns** - Adjust column widths dynamically
- ⚡ **Fast & Responsive** - Built with Vite for lightning-fast development

## 📦 Tech Stack

- **React 19.2** - Latest React with modern features
- **TypeScript** - Type-safe code
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - Utility-first styling
- **@hello-pangea/dnd** - Drag and drop library

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/jubayer17/react-grid-layout.git
cd react-grid-layout
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📖 Usage

### Creating Layouts

1. **Add Rows** - Drag the "Row" element from the sidebar to the canvas
2. **Add Columns** - Drag "Column" elements into rows
3. **Add Form Fields** - Drag form elements (Text, Email, Phone, Name) into columns
4. **Resize Columns** - Click and drag the right edge of any column to resize
5. **Delete Elements** - Drag any element to the trash bin in the bottom-right corner

### Available Components

- **Row Container** - Horizontal container for columns
- **Column Container** - Vertical container for items
- **Text Field** - Basic text input
- **Image** - Image placeholder
- **Email Field** - Email input with validation
- **Input Field** - Generic input field
- **Name Field** - Name input field
- **Phone Field** - Phone number input

## 🎨 Customization

The project uses Tailwind CSS for styling. You can customize the appearance by modifying the classes in the component files located in `src/components/`.

## 📁 Project Structure

```
react-grid-layout/
├── src/
│   ├── components/     # React components
│   │   ├── Board.tsx
│   │   ├── Column.tsx
│   │   ├── Item.tsx
│   │   ├── Row.tsx
│   │   └── Sidebar.tsx
│   ├── data/          # Data types and initial state
│   │   ├── types.ts
│   │   └── initialData.ts
│   ├── App.tsx        # Main application component
│   ├── App.css        # Global styles
│   └── main.tsx       # Application entry point
├── public/            # Static assets
├── index.html         # HTML template
└── package.json       # Dependencies
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**jubayer17**

- GitHub: [@jubayer17](https://github.com/jubayer17)

## 🙏 Acknowledgments

- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) for the drag-and-drop functionality
- [Vite](https://vitejs.dev/) for the amazing build tool
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
