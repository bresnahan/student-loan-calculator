/**
 *
 * Student Loan Calculator
 *
 * Copyright (c) 2020-2026, The Institute of Student Loan Advisors
 *
 */

const isBrowser = () => typeof window !== 'undefined'

export const trackRepaymentSelection = (planLabel, meta = {}) => {
  if (!isBrowser()) {
    return
  }

  const payload = {
    plan: planLabel,
    ...meta,
  }

  try {
    window.va && window.va('event', 'repayment_plan_selection', payload)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[analytics] trackRepaymentSelection error', error)
    }
  }
}
