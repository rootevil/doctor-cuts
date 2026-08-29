# Booking confirmation deposit — Doctor Cuts

**Status:** Stripe Checkout only for the €5 acconto. Nexi is commented out
and cannot confirm bookings even if `NEXI_API_KEY` is still in the env.

---

## Enable / disable

| Env | Effect |
| --- | --- |
| `BOOKING_DEPOSIT_ENABLED` ≠ `true` | Free booking |
| `BOOKING_DEPOSIT_ENABLED=true` + `STRIPE_SECRET_KEY` | Stripe deposit |

Also need admin setting **Acconto di conferma** on (default on).

`/api/payments/nexi` always returns 410. Confirm path is
`/api/payments/stripe` (signed webhook) or the Checkout return URL.

---

## Stripe env vars

```
BOOKING_DEPOSIT_ENABLED=true
STRIPE_SECRET_KEY=rk_live_...   # restricted key preferred; sk_live_ still works
STRIPE_WEBHOOK_SECRET=whsec_... # from Stripe Dashboard → Webhooks
NEXT_PUBLIC_SITE_URL=https://www.dr-cuts.com
```

Mark `STRIPE_SECRET_KEY` as a **Sensitive** environment variable on Vercel.
Optional: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is not required for hosted Checkout redirects.

Restricted key permissions: Checkout Sessions (write), Refunds (write),
webhook endpoint reads if you inspect events from the API.

### Dashboard (outside this repo)

1. Enable passkeys / authenticator 2FA on the Stripe account (not SMS).
2. Stripe Dashboard → Developers → Webhooks → Add endpoint  
   URL: `https://www.dr-cuts.com/api/payments/stripe`  
   Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`
3. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

---

## Customer journey

1. Servizio → Data → Orario → Dati  
2. Review: service price / pay now €5 / pay in studio  
3. **Paga €5 e conferma** → Stripe Checkout  
4. Success page + emails only after payment  

The shop hold matches Stripe Checkout expiry (30 minutes). We close the
Checkout Session **before** freeing the chair, so a late card tap cannot
pay for a slot someone else already took. If Stripe says paid, we confirm
the booking instead of refunding.

Holds are also released when Prenota or admin loads, and when Stripe
sends `checkout.session.expired`. Vercel Hobby only allows the payments
cron once a day (`18:00 UTC`); that is a backup sweep, not the primary
path.

---

## Test cards (Stripe test mode)

| Result | Card |
| --- | --- |
| OK | `4242 4242 4242 4242` |
| 3DS | `4000 0025 0000 3155` |
| Decline | `4000 0000 0000 9995` |

Any future expiry, any CVC, any ZIP.

---

## What you need from the client (live)

1. Stripe account (Italy) with KYC complete  
2. Company IBAN connected for payouts  
3. Live restricted key (`rk_live_…`) + webhook secret for production  
4. Confirm €5 = deposit toward the cut  
