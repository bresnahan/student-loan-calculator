/**
 *
 * Student Loan Calculator
 *
 * Copyright (c) 2020-2026, The Institute of Student Loan Advisors
 *
 */
export const States = {
  ALABAMA: 'ALABAMA',
  ALASKA: 'ALASKA',
  ARIZONA: 'ARIZONA',
  ARKANSAS: 'ARKANSAS',
  CALIFORNIA: 'CALIFORNIA',
  COLORADO: 'COLORADO',
  CONNECTICUT: 'CONNECTICUT',
  DELAWARE: 'DELAWARE',
  FLORIDA: 'FLORIDA',
  GEORGIA: 'GEORGIA',
  HAWAII: 'HAWAII',
  IDAHO: 'IDAHO',
  ILLINOIS: 'ILLINOIS',
  INDIANA: 'INDIANA',
  IOWA: 'IOWA',
  KANSAS: 'KANSAS',
  KENTUCKY: 'KENTUCKY',
  LOUISIANA: 'LOUISIANA',
  MAINE: 'MAINE',
  MARYLAND: 'MARYLAND',
  MASSACHUSETTS: 'MASSACHUSETTS',
  MICHIGAN: 'MICHIGAN',
  MINNESOTA: 'MINNESOTA',
  MISSISSIPPI: 'MISSISSIPPI',
  MISSOURI: 'MISSOURI',
  MONTANA: 'MONTANA',
  NEBRASKA: 'NEBRASKA',
  NEVADA: 'NEVADA',
  NEW_HAMPSHIRE: 'NEW_HAMPSHIRE',
  NEW_JERSEY: 'NEW_JERSEY',
  NEW_MEXICO: 'NEW_MEXICO',
  NEW_YORK: 'NEW_YORK',
  NORTH_CAROLINA: 'NORTH_CAROLINA',
  NORTH_DAKOTA: 'NORTH_DAKOTA',
  OHIO: 'OHIO',
  OKLAHOMA: 'OKLAHOMA',
  OREGON: 'OREGON',
  PENNSYLVANIA: 'PENNSYLVANIA',
  RHODE_ISLAND: 'RHODE_ISLAND',
  SOUTH_CAROLINA: 'SOUTH_CAROLINA',
  SOUTH_DAKOTA: 'SOUTH_DAKOTA',
  TENNESSEE: 'TENNESSEE',
  TEXAS: 'TEXAS',
  UTAH: 'UTAH',
  VERMONT: 'VERMONT',
  VIRGINIA: 'VIRGINIA',
  WASHINGTON: 'WASHINGTON',
  WEST_VIRGINIA: 'WEST_VIRGINIA',
  WISCONSIN: 'WISCONSIN',
  WYOMING: 'WYOMING',
  ELIGIBLE_TERRITORIES: 'ELIGIBLE TERRITORIES (e.g. Guam)',
}

export const CommunityPropertyStates = {
  ARIZONA: 'ARIZONA',
  CALIFORNIA: 'CALIFORNIA',
  IDAHO: 'IDAHO',
  LOUISIANA: 'LOUISIANA',
  NEVADA: 'NEVADA',
  NEW_MEXICO: 'NEW_MEXICO',
  TEXAS: 'TEXAS',
  WASHINGTON: 'WASHINGTON',
  WISCONSIN: 'WISCONSIN',
}

export const MONTHS = 12

const POVERTY_GUIDELINE_DEBUG = true
const POVERTY_API_BASE =
  'https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines/api'

const povertyDebug = (...args) => {
  if (POVERTY_GUIDELINE_DEBUG) {
    console.log('[Poverty Guidelines]', ...args)
  }
}

const buildPovertyTable = (sizes) => {
  const increment = sizes[7] - sizes[6]

  return [increment, ...sizes]
}

// 0 index is the amount for each dependent over 8 persons
// Based on: https://aspe.hhs.gov/poverty-guidelines
let FEDERAL_POVERTY_LEVEL = {
  LOWER_48: [5680, 15960, 21640, 27320, 33000, 38680, 44360, 50040, 55720],
  ALASKA: [7100, 19950, 27050, 34150, 41250, 48350, 55450, 62550, 69650],
  HAWAII: [6530, 18360, 24890, 31420, 37950, 44480, 51010, 57540, 64070],
}

const parsePovertyIncome = (data) => {
  const value = Number(data?.income ?? data?.poverty_threshold)

  if (!Number.isFinite(value)) {
    throw new Error('Invalid poverty guideline response')
  }

  return value
}

const fetchPovertyGuidelines = async (year, stateCode) => {
  const sizes = await Promise.all(
    Array.from({length: 8}, (_, index) => index + 1).map(async (size) => {
      const response = await fetch(`${POVERTY_API_BASE}/${year}/${stateCode}/${size}`)

      if (!response.ok) {
        throw new Error(`Poverty guideline API request failed (${response.status})`)
      }

      const payload = await response.json()

      return parsePovertyIncome(payload?.data)
    })
  )

  return buildPovertyTable(sizes)
}

export const refreshPovertyGuidelines = async () => {
  const year = new Date().getFullYear()

  povertyDebug('Poverty guideline year', year)

  try {
    const [lower48, alaska, hawaii] = await Promise.all([
      fetchPovertyGuidelines(year, 'us'),
      fetchPovertyGuidelines(year, 'ak'),
      fetchPovertyGuidelines(year, 'hi'),
    ])

    FEDERAL_POVERTY_LEVEL = {
      LOWER_48: lower48,
      ALASKA: alaska,
      HAWAII: hawaii,
    }

    povertyDebug('Poverty guideline API accessible', true)
    povertyDebug('Lower 48 poverty table', lower48)
    povertyDebug('Alaska poverty table', alaska)
    povertyDebug('Hawaii poverty table', hawaii)
  } catch (error) {
    console.log('[Poverty Guidelines] API error', error)
    povertyDebug('Poverty guideline API accessible', false, error)
    povertyDebug('Lower 48 poverty table', FEDERAL_POVERTY_LEVEL.LOWER_48)
    povertyDebug('Alaska poverty table', FEDERAL_POVERTY_LEVEL.ALASKA)
    povertyDebug('Hawaii poverty table', FEDERAL_POVERTY_LEVEL.HAWAII)
  }
}

// Locations of releavant data:
// 2020: https://s3.amazonaws.com/public-inspection.federalregister.gov/2020-11818.pdf
// 2025: https://www.federalregister.gov/documents/2025/08/05/2025-14806/annual-updates-to-the-income-contingent-repayment-icr-plan-formula-for-2025-william-d-ford-federal
// the values in the table below are for year: 2025
const INCOME_PERCENTAGE_FACTOR = (year, inflation) => {
  inflation = Math.pow(1 + inflation, year)

  const factors = {
    single: [
      {income: 13722, factor: 0.55},
      {income: 18881, factor: 0.5779},
      {income: 24295, factor: 0.6057},
      {income: 29831, factor: 0.6623},
      {income: 35118, factor: 0.7189},
      {income: 41786, factor: 0.8033},
      {income: 52483, factor: 0.8877},
      {income: 65824, factor: 1.0},
      {income: 79170, factor: 1.0},
      {income: 95150, factor: 1.118},
      {income: 121836, factor: 1.235},
      {income: 172561, factor: 1.412},
      {income: 197858, factor: 1.5},
      {income: 352418, factor: 2.0},
    ],
    married: [
      {income: 13722, factor: 0.5052},
      {income: 21650, factor: 0.5668},
      {income: 25800, factor: 0.5956},
      {income: 33730, factor: 0.6779},
      {income: 41786, factor: 0.7522},
      {income: 52483, factor: 0.8761},
      {income: 65823, factor: 1.0},
      {income: 79170, factor: 1.0},
      {income: 99186, factor: 1.094},
      {income: 132534, factor: 1.25},
      {income: 179230, factor: 1.406},
      {income: 250660, factor: 1.5},
      {income: 409597, factor: 2.0},
    ],
  }

  factors.single.forEach((f) => (f.income = f.income * inflation))
  factors.married.forEach((f) => (f.income = f.income * inflation))

  return factors
}

export const getIncomePercentageFactor = (income, year = 0) => {
  const {rates, filing} = income
  const agi = getTotalIncome(income)
  const list = INCOME_PERCENTAGE_FACTOR(year, rates.inflation)[
    filing === 'SINGLE' ? 'single' : 'married'
  ]

  let i
  for (i = 0; i < list.length - 1; i++) {
    if (list[i].income >= agi) {
      if (list[i].income > agi && i > 0) {
        i--
      }
      break
    }
  }

  const lower = list[i]
  const upper = list[i + 1]

  if (!upper || lower.income === agi) {
    return lower.factor
  }

  // Interoplate factor between lower and upper incomes
  const percentage = (agi - lower.income) / (upper.income - lower.income)

  return lower.factor + (upper.factor - lower.factor) * percentage
}

export const getPovertyLevel = (income, year = 0) => {
  const {dependents = 0, state, rates, filing} = income
  const isMarriedFiler = filing === 'MARRIED_JOINT' || filing === 'MARRIED_SEPARATE'
  const filers = isMarriedFiler ? 2 : 1
  const familySize = Math.max(1, dependents + filers)
  let fpl
  switch (state) {
    case States.ALASKA:
      fpl = FEDERAL_POVERTY_LEVEL.ALASKA
      break
    case States.HAWAII:
      fpl = FEDERAL_POVERTY_LEVEL.HAWAII
      break
    case States.ELIGIBLE_TERRITORIES:
      fpl = FEDERAL_POVERTY_LEVEL.LOWER_48
      break
    default:
      fpl = FEDERAL_POVERTY_LEVEL.LOWER_48
  }

  const cappedSize = Math.min(familySize, 8)
  const level =
    familySize <= 8
      ? fpl[cappedSize]
      : fpl[8] + fpl[0] * (familySize - 8)

  return level * Math.pow(1 + rates.inflation, year)
}

/*
 * If filing as "Married Filing Separately" in a Community Property
 * state, the income used is 1/2 of the applicant plus 1/2 of the 
 * spouse. 
 */ 
export const getTotalIncome = (income) => {
  const {agi = 0, agi_spouse = 0, filing, state} = income
  const normalizedAgi = Number.isFinite(Number(agi)) ? Number(agi) : 0
  const normalizedSpouseAgi = Number.isFinite(Number(agi_spouse))
    ? Number(agi_spouse)
    : 0

  switch (filing) {
    case 'MARRIED_JOINT':
      return normalizedAgi + normalizedSpouseAgi
    case 'MARRIED_SEPARATE':
      return CommunityPropertyStates[state]
        ? (normalizedAgi + normalizedSpouseAgi) / 2
        : normalizedAgi
    case 'SINGLE':
    default:
      return normalizedAgi
  }
}

export const getDiscretionaryIncome = (income, year) =>
  Math.max(0, getTotalIncome(income) - getPovertyLevel(income, year) * 1.5)

const getRapDependentCount = (income) => {
  const {dependents = 0} = income

  return Math.max(0, dependents)
}

const getRapAnnualPayment = (agi) => {
  if (agi <= 10000) {
    return 120
  }

  const brackets = [
    {max: 20000, rate: 0.01},
    {max: 30000, rate: 0.02},
    {max: 40000, rate: 0.03},
    {max: 50000, rate: 0.04},
    {max: 60000, rate: 0.05},
    {max: 70000, rate: 0.06},
    {max: 80000, rate: 0.07},
    {max: 90000, rate: 0.08},
    {max: 100000, rate: 0.09},
    {max: Number.POSITIVE_INFINITY, rate: 0.1},
  ]

  const bracket = brackets.find(({max}) => agi <= max)

  return agi * bracket.rate
}

const getRapMonthlyPayment = (income) => {
  const agi = getTotalIncome(income)
  const annualPayment = getRapAnnualPayment(agi)
  const monthlyBase = annualPayment / MONTHS
  const dependentReduction = getRapDependentCount(income) * 50

  return Math.max(10, monthlyBase - dependentReduction)
}

export const partialFinancialHardship = (loan, income, rate = 0.15) => {
  const {payment} = fixedRateRepayment(loan, 10)
  const discrectionary = getDiscretionaryIncome(income)

  return payment > (discrectionary / MONTHS) * rate
}

export const proRatedTerm = (loan, term, idr = false) => {
  const paymentsMade = Number(loan.payments) || 0
  const remainingMonths = Math.max(term * MONTHS - paymentsMade, 0)

  return idr &&
    [
      'GRADUATED',
      'FIXED_EXTENDED',
      'GRADUATED_EXTENDED',
      'STANDARD_CONSOLIDATED',
    ].includes(loan.plan)
    ? term
    : remainingMonths / MONTHS
}

// Interested is subsidized for first 3 years of subsidized loans
export const isInterestSubsidized = (loan, month, limit = 36) => {
  return (
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'STAFFORD_SUBSIDIZED',
    ].includes(loan.type) && month <= limit - loan.payments
  )
}

export const getLoanTerm = (loan) => {
  const {balance, type} = loan

  if (
    ![
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'DIRECT_PLUS_CONSOLIDATED_PARENT',
      'DIRECT_PLUS_CONSOLIDATED_NO_PARENT',
      'FFEL_CONSOLIDATED',
    ].includes(type)
  ) {
    return
  }

  if (balance < 10000) {
    return 12
  } else if (balance < 20000) {
    return 15
  } else if (balance < 40000) {
    return 20
  } else if (balance < 60000) {
    return 25
  } else {
    return 30
  }
}

export const getStandardTieredTerm = (loan) => {
  const {balance} = loan

  if (balance < 25000) {
    return 10
  } else if (balance < 50000) {
    return 15
  } else if (balance < 100000) {
    return 20
  }

  return 25
}

// TODO(wes): Inforce minimum payments
export const fixedRateRepayment = (loan, term = 10) => {
  term = proRatedTerm(loan, term)
  const {balance, rate} = loan
  const payment = getFixedPayment(balance, rate, term)
  const breakdown = getFixedBreakdown(payment, balance, rate, term)

  return {payment, breakdown}
}

export const standardTieredRepayment = (loan) => {
  const term = getStandardTieredTerm(loan)

  return fixedRateRepayment(loan, term)
}

export const graduatedRepayment = (loan, term = 10) => {
  term = proRatedTerm(loan, term)
  const {balance, rate} = loan
  const {payment, growthRate} = getGraduatedPayment(balance, rate, term)
  const breakdown = getGraduatedBreakdown(
    payment,
    balance,
    rate,
    term,
    growthRate
  )

  return {payment, breakdown}
}

export const incomeBasedRepayment = (
  loan,
  income,
  term = 25,
  disRate = 0.15
) => {
  term = proRatedTerm(loan, term, true)
  const {balance, rate} = loan
  const breakdown = getIncomeBreakdown(
    loan,
    balance,
    rate,
    term,
    income,
    disRate
  )

  return {payment: breakdown.length ? breakdown[0].payment : 0, breakdown}
}

export const rapBasedRepayment = (loan, income, term = 30) => {
  term = proRatedTerm(loan, term, true)
  const {balance, rate} = loan
  const payment = getRapMonthlyPayment(income)
  const breakdown = []

  for (let i = 0; i < term * MONTHS; i++) {
    let last = breakdown[i - 1]
    if (!last) {
      last = {
        balance,
        payment,
        endingBalance: balance,
        totalInterest: 0,
        totalPayment: 0,
        totalGovernmentForgiveness: 0,
      }
    }

    const interest = (last.endingBalance * rate) / MONTHS
    const cappedPayment = Math.min(payment, last.endingBalance + interest)
    const principalPaid = Math.max(0, cappedPayment - interest)
    let principalSubsidy = Math.max(0, 50 - principalPaid)
    let totalReduction = principalPaid + principalSubsidy

    if (totalReduction > last.endingBalance) {
      principalSubsidy = Math.max(0, last.endingBalance - principalPaid)
      totalReduction = principalPaid + principalSubsidy
    }

    const endingBalance = last.endingBalance - totalReduction
    const totalInterest = interest + last.totalInterest
    const totalPayment = cappedPayment + last.totalPayment
    const governmentForgiveness = 0
    const totalGovernmentForgiveness = last.totalGovernmentForgiveness

    breakdown.push({
      balance: last.endingBalance,
      payment: cappedPayment,
      interest,
      principle: totalReduction,
      endingBalance,
      totalInterest,
      totalPayment,
      governmentForgiveness,
      totalGovernmentForgiveness,
    })

    if (endingBalance <= 0) {
      break
    }
  }

  if (breakdown.length) {
    const finalEntry = breakdown[breakdown.length - 1]
    const forgivenBalance = Math.max(0, finalEntry.endingBalance)

    if (forgivenBalance > 0) {
      finalEntry.governmentForgiveness = forgivenBalance
      finalEntry.totalGovernmentForgiveness =
        (finalEntry.totalGovernmentForgiveness || 0) + forgivenBalance
    }
  }

  return {payment, breakdown}
}

export const getIncomeBreakdown = (
  loan,
  balance,
  interestRate,
  term,
  income,
  discretionaryRate
) => {
  let {rates} = income
  let agi = getTotalIncome(income)
  let discrectionary = getDiscretionaryIncome(income)
  const initialPayment = (discrectionary / MONTHS) * discretionaryRate
  const maxPayment = getFixedPayment(balance, interestRate, 10)

  const breakdown = []
  for (let i = 0; i < term * MONTHS; i++) {
    let last = breakdown[i - 1]
    if (!last) {
      last = {
        balance,
        payment: initialPayment,
        endingBalance: balance,
        totalInterest: 0,
        totalPayment: 0,
      }
    }

    let payment = last.payment
    let subsidizedPayment = 0
    // Increase payment every year.
    if (i > 0 && i % MONTHS === 0) {
      agi = agi * (1 + rates.income)
      discrectionary = getDiscretionaryIncome({...income, agi}, i / MONTHS)
      payment = Math.min(
        (discrectionary / MONTHS) * discretionaryRate,
        maxPayment
      )
    }
    const interest = (last.endingBalance * interestRate) / MONTHS
    if (isInterestSubsidized(loan, i) && payment < interest) {
      subsidizedPayment = interest - payment
    }
    const principle = payment + subsidizedPayment - interest
    const endingBalance = last.endingBalance - principle
    const totalInterest = interest + last.totalInterest
    const totalPayment = last.totalPayment + payment

    breakdown.push({
      balance: last.endingBalance,
      payment,
      interest,
      principle,
      endingBalance,
      totalInterest,
      totalPayment,
    })

    if (endingBalance <= 0) {
      break
    }
  }

  return breakdown
}

export const payeBasedRepayment = (
  loan,
  income,
  term = 20,
  disRate = 0.1,
  repay = false
) => {
  term = proRatedTerm(loan, term, true)
  const {balance, rate} = loan
  const breakdown = getPayeBreakdown(
    loan,
    balance,
    rate,
    term,
    income,
    disRate,
    repay
  )

  return {payment: breakdown.length ? breakdown[0].payment : 0, breakdown}
}

export const getPayeBreakdown = (
  loan,
  balance,
  interestRate,
  term,
  income,
  discretionaryRate,
  repay
) => {
  let {rates} = income
  let agi = getTotalIncome(income)
  let discrectionary = getDiscretionaryIncome(income)
  const initialPayment = (discrectionary / MONTHS) * discretionaryRate
  const maxPayment = repay
    ? Number.POSITIVE_INFINITY
    : getFixedPayment(balance, interestRate, 10)

  const breakdown = []
  for (let i = 0; i < term * MONTHS; i++) {
    let last = breakdown[i - 1]
    if (!last) {
      last = {
        balance,
        payment: initialPayment,
        endingBalance: balance,
        totalInterest: 0,
        totalPayment: 0,
      }
    }

    let payment = last.payment
    let subsidizedPayment = 0
    // Increase payment every year.
    if (i > 0 && i % MONTHS === 0) {
      agi = agi * (1 + rates.income)
      discrectionary = getDiscretionaryIncome({...income, agi}, i / MONTHS)
      payment = Math.min(
        (discrectionary / MONTHS) * discretionaryRate,
        maxPayment
      )
    }
    if (payment < 5) {
      payment = 0
    } else if (payment < 10) {
      payment = 10
    }
    const interest = (last.endingBalance * interestRate) / MONTHS
    if (isInterestSubsidized(loan, i) && payment < interest) {
      subsidizedPayment = interest - payment
    } else if (repay && payment < interest) {
      // REPAYE gets 50% subsidy on remaining term
      subsidizedPayment = (interest - payment) / 2
    }
    const principle = payment + subsidizedPayment - interest
    const endingBalance = last.endingBalance - principle
    const totalInterest = interest + last.totalInterest
    const totalPayment = last.totalPayment + payment

    breakdown.push({
      balance: last.endingBalance,
      payment,
      interest,
      principle,
      endingBalance,
      totalInterest,
      totalPayment,
    })

    if (endingBalance <= 0) {
      break
    }
  }

  return breakdown
}

export const icrBasedRepayment = (loan, income, term = 25) => {
  term = proRatedTerm(loan, term, true)
  const {balance, rate} = loan

  const breakdown = getIcrBreakdown(balance, rate, term, income)

  return {payment: breakdown.length ? breakdown[0].payment : 0, breakdown}
}

export const getIcrBreakdown = (balance, interestRate, term, income) => {
  let {rates} = income
  let agi = getTotalIncome(income)
  let discrectionary = agi - getPovertyLevel(income)
  let incomeFactor = getIncomePercentageFactor(income)
  let rollingIncome = income

  const disPay = (discrectionary / MONTHS) * 0.2
  const fixedPay = getFixedPayment(balance, interestRate, 12)
  const initialPayment = Math.max(0, Math.min(disPay, fixedPay * incomeFactor))

  const breakdown = []
  for (let i = 0; i < term * MONTHS; i++) {
    let last = breakdown[i - 1]
    if (!last) {
      last = {
        balance,
        payment: initialPayment,
        endingBalance: balance,
        totalInterest: 0,
        totalPayment: 0,
      }
    }

    let payment = last.payment
    // Increase payment every year based on income growth rate
    if (i > 0 && i % MONTHS === 0) {
      agi = agi * (1 + rates.income)
      rollingIncome = {...income, agi}
      discrectionary = agi - getPovertyLevel(rollingIncome, i / MONTHS)
      incomeFactor = getIncomePercentageFactor(rollingIncome, i / MONTHS)
      // Recalc fixed pay based on income factor
      payment = Math.max(
        0,
        Math.min((discrectionary / MONTHS) * 0.2, fixedPay * incomeFactor)
      )
    }
    if (payment > 0 && payment < 5) {
      payment = 5
    }
    const interest = (last.endingBalance * interestRate) / MONTHS
    const principle = payment - interest
    const endingBalance = last.endingBalance - principle
    const totalInterest = interest + last.totalInterest
    const totalPayment = last.totalPayment + payment

    breakdown.push({
      balance: last.endingBalance,
      payment,
      interest,
      principle,
      endingBalance,
      totalInterest,
      totalPayment,
    })

    if (endingBalance <= 0) {
      break
    }
  }

  return breakdown
}

// Calculates periodic payment amount for a loan with a constant interest rate
// and term in years. rateFactor is the number of interest periods per year.
export const getFixedPayment = (
  balance,
  interestRate,
  term = 10,
  rateFactor = MONTHS
) => {
  const Pv = balance
  const R = interestRate / rateFactor
  const n = term * MONTHS
  const P = (Pv * R) / (1 - Math.pow(1 + R, -n))

  return P
}

export const getFixedBreakdown = (payment, balance, interestRate, term) => {
  const breakdown = []
  for (let i = 0; i < term * MONTHS; i++) {
    let last = breakdown[i - 1]
    if (!last) {
      last = {
        balance,
        payment,
        endingBalance: balance,
        totalInterest: 0,
        totalPayment: 0,
      }
    }

    const interest = (last.endingBalance * interestRate) / MONTHS
    const principle = payment - interest
    const endingBalance = last.endingBalance - principle
    const totalInterest = interest + last.totalInterest
    const totalPayment = last.totalPayment + payment

    breakdown.push({
      balance: last.endingBalance,
      payment,
      interest,
      principle,
      endingBalance,
      totalInterest,
      totalPayment,
    })
  }

  return breakdown
}

export const getGraduatedPayment = (balance, interestRate, term) => {
  term = Math.ceil(term)
  // Min payment must be half of standard fixed payment
  let P = getFixedPayment(balance, interestRate, term) / 2

  // First payment must be only interest if possible
  P = Math.max(P, (balance * interestRate) / MONTHS)
  // Last payment can't be 3x initial payment
  let growthRate = Math.pow(3, 1 / (term / 2 - 1)) - 1

  // Adjust initial payment until ending balance is 0
  let breakdown = getGraduatedBreakdown(
    P,
    balance,
    interestRate,
    term,
    growthRate
  )

  while (
    breakdown.length &&
    breakdown[breakdown.length - 1].endingBalance > 0
  ) {
    P++
    breakdown = getGraduatedBreakdown(
      P,
      balance,
      interestRate,
      term,
      growthRate
    )
  }

  // If breakdown is less than full term, decrease final payment until breakdown
  // is over the entire term
  let lastP = P * Math.pow(1 + growthRate, term / 2 - 1)
  while (lastP > P + 1 && breakdown.length < term * MONTHS) {
    lastP--
    growthRate = Math.pow(lastP / P, 1 / (term / 2 - 1)) - 1

    breakdown = getGraduatedBreakdown(
      P,
      balance,
      interestRate,
      term,
      growthRate
    )
  }

  return {payment: P, growthRate}
}

export const getGraduatedBreakdown = (
  initialPayment,
  balance,
  interestRate,
  term,
  growthRate = 0.05
) => {
  const breakdown = []
  for (let i = 0; i < term * MONTHS; i++) {
    let last = breakdown[i - 1]
    if (!last) {
      last = {
        balance,
        payment: initialPayment,
        endingBalance: balance,
        totalInterest: 0,
        totalPayment: 0,
      }
    }

    let payment = last.payment
    // Increase payment every 2 yearss
    if (i > 0 && i % 24 === 0) {
      payment = payment * (1 + growthRate)
    }
    const interest = (last.endingBalance * interestRate) / MONTHS
    const principle = payment - interest
    const endingBalance = last.endingBalance - principle
    const totalInterest = interest + last.totalInterest
    const totalPayment = last.totalPayment + payment

    breakdown.push({
      balance: last.endingBalance,
      payment,
      interest,
      principle,
      endingBalance,
      totalInterest,
      totalPayment,
    })

    if (last.endingBalance <= 0) {
      break
    }
  }

  return breakdown
}
