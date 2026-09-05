import { useState } from 'react'

export const GLOSSARY: Record<string, string> = {
  APR: 'The annual cost of the loan including fees, not just the interest rate. Two loans at the same rate can have very different APRs.',
  amortization: "The schedule of payments that gradually pays off a loan — each payment covers that month's interest, and whatever's left reduces the principal.",
  principal: 'The amount actually borrowed, before any interest.',
  PMI: "Private Mortgage Insurance — an extra monthly cost lenders charge until you've built up 20% equity in the home.",
  DTI: 'Debt-to-income ratio — your monthly debt payments as a share of income. Lenders use it to cap how much you can borrow.',
  'discretionary income': 'Income left over after a protected minimum (often near the poverty line) — the base income-driven repayment plans use.',
  avalanche: 'A debt payoff order that attacks the highest interest rate first. Mathematically the cheapest strategy.',
  snowball: 'A debt payoff order that clears the smallest balance first — a faster first win, which helps some people stay consistent.',
  'balloon payment': 'A large lump sum still owed at the end of a loan term, after smaller regular payments.',
  equity: "The share of an asset you actually own — its value minus whatever's still owed against it.",
  moratorium: 'A payment holiday — interest still accrues and is added to the balance, so the loan costs more and finishes later.',
  points: 'Discount points: a fee paid up front (1 point = 1% of the loan) to buy a lower interest rate.',
  'debt-free': 'Owing nothing further on a loan or debt — the balance has reached zero.',
  refinance: 'Replacing an existing loan with a new one, usually to get a lower rate or change the term.',
  'interest-only': 'A period where payments cover only the interest charged — no principal is repaid, so the balance does not fall.',
}

/**
 * Underlines a term and shows its definition on hover/focus — a lightweight
 * glossary that doesn't add visible clutter until someone asks for it.
 */
export function Term({ children }: { children: keyof typeof GLOSSARY }) {
  const [open, setOpen] = useState(false)
  const definition = GLOSSARY[children]

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === 'Escape' && (setOpen(false), e.currentTarget.blur())}
        className="cursor-help border-b border-dotted border-slate-400 font-inherit text-inherit outline-none"
      >
        {children}
      </button>
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 text-xs font-normal normal-case leading-relaxed text-slate-600 shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          {definition}
        </span>
      )}
    </span>
  )
}
