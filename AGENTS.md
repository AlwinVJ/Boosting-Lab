# BOOSTING LAB — AGENTS GUIDE

## Architecture
- Reusable UI lives in `src/components/lab/`; structured curriculum content lives in `src/data/`.
- Pages use in-page sticky section indexes instead of a permanent sidebar (design requirement).
- Theme is dark-only; colors are semantic tokens in `src/styles.css` (violet/cyan/orange/lime/surface/hairline).
- Router uses TanStack Router file-based routing in `src/routes/`.
- Mathematics is rendered via KaTeX for accurate notation.
