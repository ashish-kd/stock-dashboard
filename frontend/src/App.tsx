// Project: React + TypeScript + Tailwind CSS Stock Dashboard
// Multi-stock table with symbol search (Alpha Vantage SYMBOL_SEARCH), add by picking suggestion
// Features: loading states, error handling, sortable table, toggling multiple charts, responsive design

import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import 'chart.js/auto'

// Type definitions
interface TimePoint { time: string; close: number }
interface StockData {
  symbol: string
  latestClose: number
  changePct: number
  history: TimePoint[]
}
interface SearchMatch { symbol: string; name: string }
// Raw series type for TS safety
interface RawTimeSeries { [time: string]: { '4. close': string } }

const API_KEY = process.env.REACT_APP_ALPHA_API_KEY
const SEARCH_API = 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH'
const DATA_API   = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY'

// Spinner component using inline styles instead of Tailwind classes
const Spinner: React.FC = () => (
  <div style={{
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '9999px',
    borderWidth: '4px',
    borderStyle: 'solid',
    borderColor: '#3b82f6 transparent #3b82f6 transparent',
    display: 'inline-block',
    animation: 'rotation 1s linear infinite'
  }}/>
)

// Add this style to your index.html or create a style.css file
// and import it into your index.js/ts file
// @keyframes rotation {
//   0% {
//     transform: rotate(0deg);
//   }
//   100% {
//     transform: rotate(360deg);
//   }
// }

const App: React.FC = () => {
  const [symbols, setSymbols]     = useState<string[]>(['AAPL'])
  const [dataMap, setDataMap]     = useState<Record<string, StockData>>({})
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
  const [errorMap, setErrorMap]   = useState<Record<string, string>>({})
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [sortAsc, setSortAsc]     = useState(true)
  const [query, setQuery]         = useState('')
  const [suggestions, setSuggestions] = useState<SearchMatch[]>([])

  // Fetch stock data
  const fetchStock = async (sym: string) => {
    setLoadingMap(m => ({ ...m, [sym]: true }))
    setErrorMap(m => ({ ...m, [sym]: '' }))
    try {
      const res = await axios.get(DATA_API, {
        params: { symbol: sym, interval: '5min', apikey: API_KEY }
      })
      // Cast for TS
      const rawSeries = res.data['Time Series (5min)'] as RawTimeSeries
      if (!rawSeries) throw new Error('No data for ' + sym)

      const points: TimePoint[] = Object.entries(rawSeries)
        .map(([time, vals]) => ({ time, close: parseFloat(vals['4. close']) }))
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

      const last = points[points.length - 1]
      const prev = points[points.length - 2]
      const changePct = ((last.close - prev.close) / prev.close) * 100

      setDataMap(m => ({
        ...m,
        [sym]: {
          symbol: sym,
          latestClose: last.close,
          changePct,
          history: points
        }
      }))
    } catch (e: any) {
      setErrorMap(m => ({ ...m, [sym]: e.message }))
      setDataMap(m => { const copy = { ...m }; delete copy[sym]; return copy })
    } finally {
      setLoadingMap(m => ({ ...m, [sym]: false }))
    }
  }

  // Fetch company symbol suggestions
  const fetchSuggestions = async (kw: string) => {
    try {
      const res = await axios.get(SEARCH_API, {
        params: { keywords: kw, apikey: API_KEY }
      })
      console.log('Suggestions:', res.data);
      const matches = res.data.bestMatches || []
      const list = matches.map((m: any) => ({
        symbol: m['1. symbol'],
        name: m['2. name']
      }))
      setSuggestions(list.slice(0, 5))
    } catch {
      setSuggestions([])
    }
  }

  // Handlers
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    if (v.length >= 2) fetchSuggestions(v)
    else setSuggestions([])
    console.log('Query:', v);
  }

  const handleAdd = (sym: string) => {
    if (!symbols.includes(sym)) setSymbols([...symbols, sym])
    setQuery('')
    setSuggestions([])
  }

  const toggleSelect = (sym: string) => {
    setSelected(s => {
      const c = new Set(s)
      c.has(sym) ? c.delete(sym) : c.add(sym)
      return c
    })
  }

  // Trigger data fetch for each symbol
  useEffect(() => {
    symbols.forEach(sym => {
      if (!dataMap[sym] && !loadingMap[sym]) fetchStock(sym)
    })
  }, [symbols, dataMap, loadingMap])

  // Sort symbols by latest price
  const sorted = useMemo(() => {
    return symbols.filter(sym => dataMap[sym]).sort((a, b) =>
      sortAsc
        ? dataMap[a].latestClose - dataMap[b].latestClose
        : dataMap[b].latestClose - dataMap[a].latestClose
    )
  }, [symbols, dataMap, sortAsc])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Stock Dashboard</h1>

      {/* Search */}
      <div className="relative mb-4">
        <input
          value={query}
          onChange={handleQueryChange}
          className="w-full border rounded px-3 py-2"
          placeholder="Search symbol or company"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full mt-1 rounded">
            {suggestions.map(s => (
              <li
                key={s.symbol}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleAdd(s.symbol)}
              >
                <span className="font-medium">{s.symbol}</span> — {s.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Symbol</th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => setSortAsc(!sortAsc)}>
                Price {sortAsc ? '↑' : '↓'}
              </th>
              <th className="py-2 px-4 border-b">Change %</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(sym => {
              const d = dataMap[sym]
              return (
                <tr
                  key={sym}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleSelect(sym)}
                >
                  <td className="py-2 px-4 border-b flex items-center gap-2">
                    {loadingMap[sym] && <Spinner />}
                    {sym}
                  </td>
                  <td className="py-2 px-4 border-b">{d ? `$${d.latestClose.toFixed(2)}` : '—'}</td>
                  <td className={`py-2 px-4 border-b ${d && d.changePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {d ? `${d.changePct.toFixed(2)}%` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Charts */}
      {Array.from(selected).map(sym => {
        const d = dataMap[sym]
        return (
          <div key={sym} className="mt-6">
            <h2 className="text-2xl font-semibold mb-2">{sym} Chart</h2>
            {errorMap[sym] && <div className="text-red-600 mb-2">{errorMap[sym]}</div>}
            {d ? (
              <Line
                data={{ labels: d.history.map(p => p.time), datasets: [{ label: sym, data: d.history.map(p => p.close), fill: false }] }}
                options={{ responsive: true, scales: { x: { display: false } } }}
              />
            ) : (
              <div className="text-gray-500">No data available</div>
            )}
          </div>
        )
      })}

      <p className="text-sm text-center text-gray-500 mt-8">Deployed on GitHub Pages</p>

      {/* Add this style tag to define the rotation animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  )
}

export default App