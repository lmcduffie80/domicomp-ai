# DomiComp AI

B2B real estate comps + rehab tool. **Powered by Agrovus.**

## Stack

- Next.js on Vercel
- Clerk Organizations + Billing (Pro $79 / Team $199)
- Neon Postgres + Vercel Blob
- OpenAI + RentCast

## Local development

```bash
pnpm install
pnpm db:push
pnpm seed:old-vine -- --admin-email=you@example.com
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, then open `/app`.

`ALLOW_UNPAID_ACCESS=true` in `.env.local` lets you use the app before Clerk Billing plans are configured. Old Vine Properties, LLC is forever-comped via org `publicMetadata.comped`.

## Production checklist

1. Claim the Clerk app: `pnpm dlx clerk@latest auth login`
2. Enable Organizations (membership required) and Billing for orgs in the Clerk Dashboard
3. Create **pro** and **team** plans ($79 / $199) with seat limits
4. Push secrets to Vercel (production + preview): `OPENAI_API_KEY`, `RENTCAST_API_KEY`, Clerk keys, `ALLOW_UNPAID_ACCESS=false`
5. Create a Blob read/write token for local uploads if needed (`BLOB_READ_WRITE_TOKEN`)
6. Deploy: `vercel --prod --scope lee-mcduffies-projects`
7. Point Clerk webhook to `https://<domain>/api/webhooks/clerk`

## Old Vine Properties, LLC

Founder org with Team entitlements (`comped: true`). Re-run:

```bash
pnpm seed:old-vine -- --admin-email=your@email.com
```
