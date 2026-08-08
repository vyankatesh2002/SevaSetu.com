# Supabase Integration Notes

The current `CIP.html` saves only to `sessionStorage`.

Goal: connect Supabase and write complaint rows into table `complaints` using the existing publishable key.

### Must use
- Use only `sb_publishable_...` in browser.
- Never use `sb_secret_...` in frontend.

### Frontend requirements
Add:
- Supabase JS CDN import
- `SUPABASE_URL` + `SUPABASE_KEY`
- `window.supabaseClient = createClient(...)`
- In `submitComplaint()`, call:
  `await supabase.from('complaints').insert([{ ... }])`

### Next needed by user (if insert fails)
- Open browser DevTools Network tab and paste failed request status/body.
- Or paste console error.

