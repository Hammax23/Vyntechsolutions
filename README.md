# VynTech Solutions

Next.js application with Swagger API documentation.

## Getting Started

### Next.js frontend

```bash
docker compose up -d postgres
npm install
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Strapi CMS (headless)

```bash
docker compose up -d strapi_db
cd cms
npm install
npm run develop
```

Admin: [http://localhost:1337/admin](http://localhost:1337/admin)  
Docs: [cms/README.md](cms/README.md) · Deploy: [deploy/STRAPI_DEPLOY.md](deploy/STRAPI_DEPLOY.md)

SEO experts edit Blog, Services, Industries, FAQs, SEO, Homepage, Legal, Nav, Promos, Jobs in Strapi. Frontend stays Next.js.

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
