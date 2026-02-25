<!--
Student Loan Calculator Design Notes

Copyright (c) 2020-2026, TISLA.

-->

# Student Loan Calculator Design Summary

## 1. High-Level Description
The student loan calculator is a web-based tool that models federal student loan repayment options. It collects borrower income, family size, tax filing status, and loan portfolio data to compute monthly payments, total interest, and forgiveness outcomes across multiple repayment plans. The calculator also supports data sharing via URL parameters and refreshes poverty guideline data from official government sources.

The calculator was originally written in 2020 and was updated in 2026.

## 2. RAP Repayment Changes
RAP (Repayment Assistance Plan) now honors changing income inputs and accounts for prior payments made when prorating the remaining term. The repayment breakdown correctly caps payments to remaining balance plus interest while keeping government forgiveness and principal subsidy accounting intact across the adjusted term.

## 3. Standard Tiered Repayment Changes
A new Standard Tiered repayment plan was added. The plan selects a repayment term based on total loan balance tiers (10, 15, 20, or 25 years). The tiered term is applied to calculate fixed monthly payments and to generate a full amortization breakdown consistent with other standard repayment options.

## 4. Poverty API Support
Poverty guideline data was updated to 2026 values and renamed for clarity. The calculator now refreshes poverty guideline tables at app load using the HHS/ASPE poverty guideline API and logs debug output when enabled. API failures are logged to the console to ensure visibility while retaining the static table as a fallback.

## 5. ICR Income Percentage Updates
The ICR income percentage factor table was updated to the 2025 Federal Register values. The calculator uses these updated income-factor pairs to compute the ICR payment percentage based on borrower income and filing status.

## 6. Tests
- Validate RAP calculations against known cases where income changes mid-plan and prior payments shorten the term.
- Verify Standard Tiered term selection for representative balances across all tiers.
- Confirm poverty guideline API refresh updates values and logs errors on failure.
- Compare ICR payment outputs against the 2025 Federal Register examples.
- Run the UI to ensure income inputs, share link, and repayment options render without warnings.

### Test case, ICR1: From Federal Register for ICR repayment.
Example 1.

Kesha is single with no dependents and has $15,000 in Direct Loans that are eligible for repayment under the ICR plan. The interest rate on Kesha's loans is 6 percent, and she has an AGI of $35,118.

Expected montly payment: $105.23

http://localhost:3000/?c=eyJsb2FucyI6W3siaWQiOjAsImJhbGFuY2UiOjE1MDAwLCJyYXRlIjowLjA2LCJ0eXBlIjoiRElSRUNUX1NVQlNJRElaRUQiLCJwbGFuIjoiIiwicGF5bWVudHMiOjAsImV4cGFuZGVkIjp0cnVlfV0sImluY29tZSI6eyJhZ2kiOjM1MTE4LCJhZ2lfc3BvdXNlIjoyNTAwMCwiZGVwZW5kZW50cyI6MSwic3RhdGUiOiJBTEFCQU1BIiwiZmlsaW5nIjoiU0lOR0xFIiwicmF0ZXMiOnsiaW5jb21lIjowLjAyNSwiaW5mbGF0aW9uIjowLjAyMzZ9fX0=

### Test case, ICR2: From Federal Register for ICR repayment.
Example 2.

Paul is married to Jesse, and they have no dependents. They file their Federal income tax return jointly. Paul has a Direct Loan balance of $10,000, and Jesse has a Direct Loan balance of $15,000. Both of their Direct Loans are eligible for repayment under the ICR plan and have an interest rate of 6 percent.

Paul and Jesse have a combined AGI of $99,186 and are repaying their loans jointly under the ICR plan (for general information regarding joint ICR payments for married couples, see the fifth and sixth bullets under the heading “General notes about the examples in this attachment”).

Expected monthly payment: $267 combined.

http://localhost:3000/?c=eyJsb2FucyI6W3siaWQiOjAsImJhbGFuY2UiOjEwMDAwLCJyYXRlIjowLjA2LCJ0eXBlIjoiRElSRUNUX1NVQlNJRElaRUQiLCJwbGFuIjoiIiwicGF5bWVudHMiOjAsImV4cGFuZGVkIjpmYWxzZX0seyJpZCI6MSwiYmFsYW5jZSI6MTUwMDAsInJhdGUiOjAuMDYsInR5cGUiOiJESVJFQ1RfU1VCU0lESVpFRCIsInBsYW4iOiIiLCJwYXltZW50cyI6MCwiZXhwYW5kZWQiOnRydWV9XSwiaW5jb21lIjp7ImFnaSI6OTkxODYsImFnaV9zcG91c2UiOjAsImRlcGVuZGVudHMiOjIsInN0YXRlIjoiQUxBQkFNQSIsImZpbGluZyI6Ik1BUlJJRURfSk9JTlQiLCJyYXRlcyI6eyJpbmNvbWUiOjAuMDI1LCJpbmZsYXRpb24iOjAuMDIzNn19fQ==


### Test case, ICR3: From Federal Register for ICR repayment.
Example 3.

Santiago is single with no dependents and has a combined balance of $60,000 in Direct Loans that are eligible for repayment under the ICR plan. Each of Santiago's loans has an interest rate of 6 percent, and Santiago's AGI is $41,786.

Expected payment per government doc: $435.60
http://localhost:3000/?c=eyJsb2FucyI6W3siaWQiOjEsImJhbGFuY2UiOjYwMDAwLCJyYXRlIjowLjA2LCJ0eXBlIjoiRElSRUNUX1NVQlNJRElaRUQiLCJwbGFuIjoiIiwicGF5bWVudHMiOjAsImV4cGFuZGVkIjp0cnVlfV0sImluY29tZSI6eyJhZ2kiOjQxNzg2LCJhZ2lfc3BvdXNlIjowLCJkZXBlbmRlbnRzIjoxLCJzdGF0ZSI6IkFMQUJBTUEiLCJmaWxpbmciOiJTSU5HTEUiLCJyYXRlcyI6eyJpbmNvbWUiOjAsImluZmxhdGlvbiI6MC4wMDAyfX19

### Test case, ICR4: Betsy
Loan balance $85K
AGI $60K
Single with 1 child

$60K - $21,150(100% of poverty level for family size of two) = $38,850

$38,850 x 20% = $7770/12 = 647.50 monthly

Test result: $639 for 18 years.

### Test case, RAP1: Betsy
Loan balance $60K @ 6%
Single with 1 child

expected MPA: $250
Test result: $200 for 30 years, $72K total, $37,845 of forgiveness.

### Test case, Old IBR1: Betsy

### Test case, New IBR1 and PAYE: Betsy



Dept of Ed Calc result: 


