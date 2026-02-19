/**
 *
 * Student Loan Calculator
 *
 * Copyright (c) 2020-2026, The Institute of Student Loan Advisors
 *
 */
import PropTypes from 'prop-types'
import React from 'react'
import {currency, hexToRgbA, simplifyCurrency} from '../shared/helpers'
import {Line as LineChart} from 'react-chartjs-2'

const getYearBreakdown = (breakdown, attr) => {
  const years = []
  for (let i = 12; i <= breakdown.length; i += 12) {
    years.push(breakdown[i - 1][attr] || 0)
  }

  if (breakdown.length && breakdown.length % 12 !== 0) {
    years.push(breakdown[breakdown.length - 1][attr] || 0)
  }

  return years
}

const getMonthlyBreakdown = (breakdown, attr) =>
  breakdown.map(item => item[attr] || 0)

const dataset = (label, data, bgColor) => ({
  label,
  data,
  fill: 'origin',
  lineTension: 0.1,
  borderColor: bgColor,
  backgroundColor: hexToRgbA(bgColor, 0.1),
  hoverBackgroundColor: hexToRgbA(bgColor, 1),
  borderWidth: 2,
  pointRadius: 0,
  pointHitRadius: 5,
  pointBackgroundColor: bgColor
})

const getTickStep = maxValue => {
  if (!maxValue || maxValue <= 0) {
    return 1
  }

  const roughStep = maxValue / 8
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const candidates = [1, 2, 5, 10].map(multiplier => multiplier * magnitude)
  return candidates.find(candidate => candidate >= roughStep) || candidates[3]
}

const getChartOptions = (useMonths, maxValue) => {
  const tickStep = getTickStep(maxValue)
  const maxTick = Math.ceil(maxValue / tickStep) * tickStep

  return {
  layout: {
    padding: {right: 20}
  },
  plugins: {
    legend: {display: false},
    tooltip: {
      // Draws tooltips whenever the mouse hovers over the chart. This is
      // useful because we draw the same tooltip for each bar in a "bar" in a
      // group of bars and it is a bit jarring to continually redraw the same
      // tooltip as the mouse moves across the bars.
      intersect: false,
      // This includes every dataset in a group of bars inside the tooltip.
      mode: 'index',
      displayColors: false,
      callbacks: {
        label: ctx => `${ctx.dataset.label}: ${currency(ctx.raw)}`,
        title: ctx =>
          useMonths ? `Month ${ctx[0].dataIndex + 1}` : `Year ${ctx[0].label}`
      }
    }
  },
  scales: {
    x: {
      type: 'category',
      grid: {display: false, drawBorder: false},
      title: {
        display: true,
        text: useMonths ? 'Month' : 'Year',
        padding: {top: 10}
      },
      ticks: {
        display: true,
        padding: -6,
        callback: value => {
          const tickValue = Number(value) + 1

          if (!useMonths) {
            return tickValue
          }

          return tickValue % 6 === 1 ? tickValue : null
        }
      }
    },
    y: {
      beginAtZero: true,
      min: 0,
      suggestedMax: maxTick,
      grid: {display: false, drawBorder: false},
      ticks: {
        stepSize: tickStep,
        callback: (value, index) =>
          index > 0 && index % 2 ? simplifyCurrency(value) : null
      }
    }
  }
}
}

const getChartData = (repayments, attr) => {
  const eligible = repayments.filter(r => r.eligible)
  const maxMonths = eligible.reduce(
    (max, repayment) => Math.max(max, repayment.breakdown.length),
    0
  )
  const useMonths = maxMonths > 0 && maxMonths <= 24
  const dataExtractor = useMonths ? getMonthlyBreakdown : getYearBreakdown
  const datasets = eligible.map(r =>
    dataset(r.label, dataExtractor(r.breakdown, attr), r.color)
  )

  // Find largest data set to construct labels
  let max = 0
  datasets.forEach(d => {
    if (d.data.length > max) {
      max = d.data.length
    }
  })

  const data = {
    datasets,
    labels: new Array(max).fill(0).map((r, i) => `${i + 1}`)
  }

  const maxValue = datasets.reduce(
    (currentMax, dataset) =>
      Math.max(currentMax, ...dataset.data.map(value => value || 0)),
    0
  )

  return {data, useMonths, maxValue}
}

const Chart = ({payments, compare, options}) => {
  const {data, useMonths, maxValue} = getChartData(payments, compare)

  return (
    <LineChart
      data={data}
      options={getChartOptions(useMonths, maxValue)}
      {...options}
    />
  )
}

Chart.propTypes = {
  payments: PropTypes.array,
  compare: PropTypes.string.isRequired,
  options: PropTypes.object
}

export default Chart
