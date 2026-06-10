const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))
const cheerio = require('cheerio')

async function analyze(year) {
  const url = 'https://en.wikipedia.org/w/api.php?action=parse&page=List+of+Tamil+films+of+' + year + '&prop=text&format=json&redirects=1'
  const res = await fetch(url, { headers: { 'User-Agent': 'TamilCinemaHub/1.0' } })
  if (!res.ok) return { year, error: 'HTTP ' + res.status }
  const data = await res.json()
  const $ = cheerio.load(data.parse.text['*'])

  const results = { year, tables: [] }

  $('table').each((i, table) => {
    const cls = $(table).attr('class') || ''
    const rows = $(table).find('tr').length
    const firstText = $(table).find('tr').first().text().toLowerCase().trim()
    const hasTitleDir = firstText.includes('title') && firstText.includes('director')
    const hasLinks = $(table).find('a[href^="/wiki/"]').length > 5

    if (rows > 2 && hasLinks && (cls.includes('wikitable') || hasTitleDir)) {
      const headers = []
      $(table).find('tr').first().find('th').each((j, th) => {
        headers.push($(th).text().trim())
      })
      results.tables.push({ class: cls, rows, headers, isBoxOffice: firstText.includes('rank') || firstText.includes('gross') })
    }
  })

  return results
}

async function main() {
  for (let year = 2000; year <= 2026; year++) {
    const r = await analyze(year)
    const totalFilms = r.tables.filter(t => !t.isBoxOffice).reduce((s, t) => s + t.rows, 0)
    const tableInfo = r.tables.map(t => (t.isBoxOffice ? '📊' : '🎬') + ' [' + t.class.substring(0, 30) + '] rows=' + t.rows + ' headers=' + t.headers.join('|'))
    console.log(year + ': ' + totalFilms + ' films ' + tableInfo.join(' '))
  }
}

main().catch(console.error)
