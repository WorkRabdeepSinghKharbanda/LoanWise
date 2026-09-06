---
protected_branches: ["archive"]
---

# Branching strategy

Personal solo project. No feature-branch/PR workflow — commits go straight to `master`.

## Deploy

After every push to `master`, run `vercel --prod --yes` directly from the terminal — don't rely
solely on Vercel's git-integration auto-deploy. Verify with a curl check against the production
alias (https://loan-calculator-ashen-six.vercel.app) after deploying.
