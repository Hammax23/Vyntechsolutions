# VynTech Solutions

Next.js application with Swagger API documentation.

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### API Documentation

Visit [http://localhost:3000/api-docs](http://localhost:3000/api-docs) to view Swagger API documentation.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── docs/
│   │   │   └── route.ts      # Swagger spec endpoint
│   │   └── hello/
│   │       └── route.ts      # Sample API endpoint
│   ├── api-docs/
│   │   └── page.tsx          # Swagger UI page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
└── lib/
    └── swagger.ts            # Swagger configuration
```

## Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Swagger UI** - API documentation
- **next-swagger-doc** - Swagger spec generation

## GitHub Repository

This project is connected to: https://github.com/Hammax23/Vyntechsolutions.git
