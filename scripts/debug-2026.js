const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))
const cheerio = require('cheerio')

async function main() {
  const url = 'https://en.wikipedia.org/w/api.php?action=parse&page=List+of+Tamil+films+of+2026&prop=text&format=json&redirects=1'
  const res = await fetch(url, { headers: { 'User-Agent': 'Test/1.0' } })
  const data = await res.json()
  const $ = cheerio.load(data.parse.text['*'])

  console.log('=== All tables with >1 rows ===')
  $('table').each((i, table) => {
    const cls = $(table).attr('class') || '(no class)'
    const rows = $(table).find('tr').length
    const firstText = $(table).find('tr').first().text().trim().substring(0, 100).replace(/\s+/g, ' ')
    const hasLinks = $(table).find('a[href^="/wiki/"]').length

    if (rows > 1 && hasLinks > 0) {
      console.log(`\nTable ${i}: class="${cls}" rows=${rows} links=${hasLinks}`)
      console.log(`  First row: "${firstText}"`)
      
      // Show header columns
      $(table).find('tr').first().find('th').each((j, th) => {
        console.log(`  Header ${j}: "${$(th).text().trim().substring(0, 30)}"`)
      })
      
      // Show first data row
      const secondRow = $(table).find('tr').eq(1)
      secondRow.find('td').each((j, td) => {
        const link = $(td).find('a').first()
        const text = link.length ? link.text().trim() : $(td).text().trim().substring(0, 40)
        console.log(`  Row1 Col${j}: "${text}"`)
      })
    }
  })
}

main().catch(console.error)
