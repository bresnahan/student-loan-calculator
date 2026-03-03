/**
 *
 * Student Loan Calculator - Loan List
 *
 * Copyright (c) 2020-2026, The Institute of Student Loan Advisors
 *
 */

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Loan from './loan'
import PropTypes from 'prop-types'
import React, {useCallback, useEffect, useMemo, useReducer} from 'react'
import {CSSTransition, TransitionGroup} from 'react-transition-group'
import {consolidateLoans} from '../shared/loan_config.js'
import {currency, formatFloat, plural} from '../shared/helpers'
import {listReducer, useRouteConfig} from '../shared/hooks'

let LOAN_ID = 1

const LoanList = ({
  loans,
  income,
  onChange,
  bBorrowAfter070126,
  bPSLF,
  onPolicyChange,
}) => {
  const [list, updateList] = useReducer(listReducer, loans)
  const onLoanChange = useCallback(
    (id, data) => updateList({type: 'update', id, data}),
    [updateList]
  )
  const onLoanAdd = useCallback(() => {
    // Collapse any expanded loans
    list
      .filter(i => i.expanded)
      .forEach(({id}) =>
        updateList({type: 'update', id, data: {expanded: false}})
      )
    // Add new loan
    updateList({
      type: 'add',
      data: {
        id: LOAN_ID++,
        balance: 10000,
        rate: 0.05,
        type: 'DIRECT_SUBSIDIZED',
        plan: '',
        payments: 0,
        expanded: true
      }
    })
  }, [list, updateList])

  const onLoanRemove = useCallback(id => updateList({type: 'remove', id}), [
    updateList
  ])

  const onLoanClick = useCallback(
    id => {
      list
        .filter(i => i.expanded)
        .forEach(({id}) =>
          updateList({type: 'update', id, data: {expanded: false}})
        )
      updateList({type: 'update', id, data: {expanded: true}})
    },
    [list, updateList]
  )

  useEffect(() => {
    onChange(list)
  }, [list, onChange])

  useRouteConfig(config => {
    updateList({type: 'replaceAll', data: config.loans})
    LOAN_ID = config.loans.length
  })

  const loan = useMemo(() => consolidateLoans(list, income), [list, income])

  const onBorrowAfterChange = useCallback(
    (event) => {
      if (!onPolicyChange) {
        return
      }
      onPolicyChange({
        bBorrowAfter070126: event.target.checked,
        bPSLF,
      })
    },
    [onPolicyChange, bPSLF]
  )

  const onPslfChange = useCallback(
    (event) => {
      if (!onPolicyChange) {
        return
      }
      onPolicyChange({
        bBorrowAfter070126,
        bPSLF: event.target.checked,
      })
    },
    [onPolicyChange, bBorrowAfter070126]
  )

  return (
    <>
      <div>
        <TransitionGroup component="div">
          {list.map(loan => (
            <CSSTransition key={loan.id} classNames="loan" timeout={250}>
              <Loan
                loan={loan}
                onChange={onLoanChange}
                onRemove={onLoanRemove}
                onClick={onLoanClick}
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
      <div className="bg-light p-3 mb-3 d-flex rounded-bottom">
        <div className="flex-grow-1">
          {list.length} {plural(list.length, 'loan')} total
          <br />
          <strong>{currency(loan.balance)}</strong> at{' '}
          <strong>{formatFloat(loan.rate * 100)}%</strong>
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          className="align-self-center"
          onClick={onLoanAdd}>
          Add another loan
        </Button>
      </div>
      <div className="bg-light p-3 mb-3 rounded">
        <Form.Group className="mb-2">
          <Form.Check
            type="checkbox"
            id="borrow-after-070126"
            label="Did you borrow or consolidate on or after July 1, 2026?"
            checked={Boolean(bBorrowAfter070126)}
            onChange={onBorrowAfterChange}
          />
        </Form.Group>
        <Form.Group className="mb-0">
          <Form.Check
            type="checkbox"
            id="pslf"
            label={
              <span>
                Are you pursuing Public Service Loan Forgiveness (PSLF)?{' '}
                <a
                  href="https://freestudentloanadvice.org/loan-forgiveness/public-service-loan-forgiveness/"
                  target="_blank"
                  rel="noopener noreferrer">
                  (Help)
                </a>
              </span>
            }
            checked={Boolean(bPSLF)}
            onChange={onPslfChange}
          />
        </Form.Group>
      </div>
    </>
  )
}

LoanList.propTypes = {
  onChange: PropTypes.func,
  loans: PropTypes.array,
  income: PropTypes.object,
  bBorrowAfter070126: PropTypes.bool,
  bPSLF: PropTypes.bool,
  onPolicyChange: PropTypes.func,
}

export default LoanList
