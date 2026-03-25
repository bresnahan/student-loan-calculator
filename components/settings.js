import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import PropTypes from 'prop-types'
import React, {useEffect} from 'react'
import {asFloat, useDeferredOnChange} from '@standardlabs/react-hooks'
import {formatFloat} from '../shared/helpers'

const Settings = ({onChange, rates, ...props}) => {
  const [incomeGrowth, setIncomeGrowth] = useDeferredOnChange(
    rates.income * 100,
    150,
    asFloat
  )
  const [inflationRate, setInflationRate] = useDeferredOnChange(
    rates.inflation * 100,
    150,
    asFloat
  )

  const toPercent = value =>
    Number.isFinite(value) ? value / 100 : 0

  useEffect(() => {
    onChange({
      income: toPercent(incomeGrowth.deferred),
      inflation: toPercent(inflationRate.deferred)
    })
  }, [incomeGrowth.deferred, inflationRate.deferred, onChange])

  const displayValue = value =>
    Number.isFinite(value) ? formatFloat(value) : ''

  return (
    <Form {...props}>
      <Form.Row>
        <Col xs={12} sm={6}>
          <Form.Group>
            <Form.Label>Annual income growth</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                min={0}
                step={0.1}
                value={displayValue(incomeGrowth.value)}
                onChange={setIncomeGrowth}
              />
              <InputGroup.Append>
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Annual inflation rate</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                min={0}
                step={0.01}
                value={displayValue(inflationRate.value)}
                onChange={setInflationRate}
              />
              <InputGroup.Append>
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
          </Form.Group>
        </Col>
      </Form.Row>
    </Form>
  )
}

Settings.propTypes = {
  rates: PropTypes.object,
  onChange: PropTypes.func
}

export default Settings
