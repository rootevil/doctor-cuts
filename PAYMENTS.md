# Booking confirmation deposit — Doctor Cuts

**Status:** Stripe Checkout for the €5 acconto. Nexi code remains as a
fallback but Stripe is preferred when `STRIPE_SECRET_KEY` is set.

---

## Enable / disable

| Env | Effect |
| --- | --- |
| `BOOKING_DEPOSIT_ENABLED` ≠ `true` | Free booking |
| `BOOKING_DEPOSIT_ENABLED=true` + `STRIPE_SECRET_KEY` | Stripe deposit |
| Same + only `NEXI_API_KEY` | Nexi deposit (legacy) |

Also need admin setting **Acconto di conferma** on (default on).

---

## Stripe env vars

```
BOOKING_DEPOSIT_ENABLED=true
STRIPE_SECRET_KEY=sk_test_...   # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... # from Stripe Dashboard → Webhooks
NEXT_PUBLIC_SITE_URL=https://www.dr-cuts.com
```

Optional: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is not required for hosted Checkout redirects.

### Webhook (required for reliable confirms)

1. Stripe Dashboard → Developers → Webhooks → Add endpoint  
2. URL: `https://www.dr-cuts.com/api/payments/stripe`  
3. Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`  
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

---

## Customer journey

1. Servizio → Data → Orario → Dati  
2. Review: service price / pay now €5 / pay in studio  
3. **Paga €5 e conferma** → Stripe Checkout  
4. Success page + emails only after payment  

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
3. Live keys (`sk_live_…`) + webhook secret for production  
4. Confirm €5 = deposit toward the cut  

---

## Nexi (paused / optional)

Set only if you prefer Nexi over Stripe. Requires XPay API keys from Nexi Business.
