<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Reusable UI lives in `src/components/lab/`; all placeholder content/data lives in `src/data/content.ts` so real content can replace it without touching layouts.
- Pages use in-page sticky section indexes instead of a permanent sidebar (design requirement).
- Theme is dark-only; colors are semantic tokens in `src/styles.css` (violet/cyan/orange/lime/surface/hairline).
