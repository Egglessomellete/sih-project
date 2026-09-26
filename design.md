# Design System

## Style

Modern, minimal, professional. Calm government-civic product — not a social app. Citizen screens prefer **few elements, large hit targets (min 44px), plain language**.

Animation: use sparingly. Prefer small Motion (motion.dev) fades/layout for tickets and Help tour. Prefer React Bits only for **solver** flourishes if they do not harm contrast or performance. **Never** use heavy effects on citizen submit or login.

## Typography

- Font: **Inter** (next/font).
- Citizen body: 16–18px; headings 24–32px.
- Solver tables: 14px allowed.
- Line length: comfortable; avoid walls of text.

## Colors

| Token | Hex | Use |
| --- | --- | --- |
| Primary | `#dccede` | Primary buttons, chips, selected nav (pair with dark text) |
| Background | `#f7f2f3` | Page background |
| Text | `#201D1D` | Headings and body |
| Muted | `#7F839F` | Secondary labels, placeholders, timestamps |

Derived (allowed):

- Primary hover: slightly darker mix toward `#201D1D`
- Card surface: `#ffffff`
- Border: `rgba(32,29,29,0.08)`
- Destructive: deep red for delete/reject only (`#B42318` text/button on white)
- Success: restrained green for “solved”
- Focus ring: 2px solid `#201D1D`

**Contrast:** primary `#dccede` is light — **do not put white text on primary**. Use `#201D1D` on primary buttons.

## Buttons

- **Primary** — filled `#dccede`, text `#201D1D`, radius 12px, full width on mobile citizen CTAs
- **Secondary** — outline, text `#201D1D`
- **Destructive** — reject/delete only; confirm dialog

## Cards

- Border radius: **12px**
- White surface, light border, little or no shadow
- Ticket card: status pill, domain, district, last update

## UX requirements

- Mobile responsive (citizen-first)
- Loading states (skeleton or labeled spinner)
- Empty states (what to do next, not a blank table)
- Error states (human language, how to fix)
- Accessible forms: labels, `htmlFor`, errors tied to inputs, no placeholder-only labels
- Help: `?` / “मदद” always visible after login; first session auto-starts tour
- Language toggle: हिंदी | English on citizen chrome

## Motion / React Bits (allowed later)

Document any adopted example in this file (name + URL) before use. Default: CSS + one tour library. Skip if it breaks elderly usability.

## Layout

- Citizen: top bar (logo, Help, language, logout) + one column
- Solver: side nav (queue, accept, tickets, analysis, dashboard)
