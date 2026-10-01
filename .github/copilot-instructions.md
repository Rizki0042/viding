# Workspace instructions

- This project uses Next.js App Router with JavaScript; React UI lives in `src/app` and API Route Handlers live beside routes.
- Keep user-facing storefront copy in Indonesian and follow the existing visual tokens in `src/app/globals.css`.
- Database access goes through the shared Prisma client in `src/lib/prisma.js`; never expose connection strings to client components.
- Keep `.env.local` and SQLite database files out of Git. Use the seed catalog only for local development.
- Validate changes with `npm run lint` and `npm run build`; run `npm run db:setup` before testing database-backed routes.
