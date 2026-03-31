/**
 *
 * Student Loan Calculator
 *
 * Copyright (c) 2020-2026, The Institute of Student Loan Advisors
 *
 */

import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import PropTypes from 'prop-types'
import React, {useEffect} from 'react'
import Select from './select'
import {
  CommunityPropertyStates,
  States,
  getDiscretionaryIncome,
} from '../shared/calc'
import {TaxFilingStatus} from '../shared/loan_config'
import {currency} from '../shared/helpers'

import {asInt, useDeferredOnChange, useOnChange} from '@standardlabs/react-hooks'

const bDebug = false

const IncomeForm = ({onChange, income, ...props}) => {
  const [agi, onChangeAgi] = useDeferredOnChange(income.agi, 150, asInt)
  const [agiSpouse, onChangeAgiSpouse] = useDeferredOnChange(
    income.agi_spouse,
    150,
    asInt
  )
  const [dependents, onChangeDependants] = useOnChange(income.dependents, asInt)
  const [state, onChangeState] = useOnChange(income.state)
  const [filing, onChangeFiling] = useOnChange(income.filing)

  useEffect(() => {
    const hasDependentsValue = dependents !== undefined && dependents !== null

    if (agi.deferred && hasDependentsValue && state && filing) {
      onChange({
        agi: agi.deferred,
        agi_spouse: agiSpouse.deferred,
        dependents,
        state,
        filing,
      })
    }
  }, [onChange, agi.deferred, agiSpouse.deferred, dependents, state, filing])

  const isSingle = filing === 'SINGLE'
  const isCommunityProperty = Boolean(CommunityPropertyStates[state])
  const dependentsCount = Number(dependents) || 0
  const dependentsLabel = `${dependentsCount} ${dependentsCount === 1 ? 'dependent' : 'dependents'}. `
  const toNumber = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  const normalizedAgi = toNumber(agi.value)
  const normalizedSpouseAgi = toNumber(agiSpouse.value)
  const rates = income?.rates ?? {income: 0, inflation: 0}
  const discretionaryIncome = state
    ? getDiscretionaryIncome({
        agi: normalizedAgi,
        agi_spouse: normalizedSpouseAgi,
        dependents: dependentsCount,
        state,
        filing,
        rates,
      })
    : null
  const discretionaryLabel = Number.isFinite(discretionaryIncome)
    ? `Discretionary Income is ${currency(discretionaryIncome)}. `
    : ''

  let filingHelp = ''
  if (!isSingle) {
    filingHelp =
      'Certain repayment plans include spousal income when calculating monthly payments, even if filing separately.'
    if (filing === 'MARRIED_SEPARATE' && isCommunityProperty) {
      filingHelp +=
        ' In Community Property states, income is 1/2 of combined income if Married Filing Separately.'
    }
  }

  return (
    <Form {...props}>
      <Form.Row>
        <Col>
          <Form.Group>
            <Form.Label>Tax filing status</Form.Label>
            <Select onChange={onChangeFiling} value={filing}>
              {Object.entries(TaxFilingStatus).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Dependents</Form.Label>
            <Select onChange={onChangeDependants} value={dependents}>
              {Array.from({length: 21}, (_, index) => (
                <option key={index} value={index}>
                  {index}
                </option>
              ))}
            </Select>
          </Form.Group>
        </Col>
      </Form.Row>
      <Form.Row>
        <Col>
          <Form.Group>
            <Form.Label>State / Territory</Form.Label>
            <Select onChange={onChangeState} value={state}>
              {Object.entries(States).map(([key, value]) => {
                const label = value.replace(/_/g, ' ')
                const suffix = CommunityPropertyStates[key]
                  ? ' (Community Property state)'
                  : ''

                return (
                  <option key={key} value={key}>
                    {label + suffix}
                  </option>
                )
              })}
            </Select>
          </Form.Group>
        </Col>
      </Form.Row>
      <Form.Row>
        <Col xs={12} sm={6}>
          <Form.Group>
            <Form.Label>Adjusted gross income</Form.Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                placeholder="50000"
                value={agi.value}
                type="number"
                min={1000}
                step={5000}
                onChange={onChangeAgi}
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col xs={12} sm={6}>
          <Form.Group>
            <Form.Label>Spouse income</Form.Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                value={agiSpouse.value ?? ''}
                type="number"
                min={1000}
                step={5000}
                onChange={onChangeAgiSpouse}
                disabled={isSingle}
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col className="mt-n3 mb-2">
          <Form.Text muted>
            {bDebug && (
              <>
                {dependentsLabel}
                {discretionaryLabel}
              </>
            )}
            {filingHelp}
          </Form.Text>
        </Col>
      </Form.Row>
    </Form>
  )
}

IncomeForm.propTypes = {
  onChange: PropTypes.func,
  income: PropTypes.object,
}

export default IncomeForm
