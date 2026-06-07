export const latestMoviesQuery = `*[_type == "movie"] | order(year desc, _createdAt desc)[0...6] {
  _id,
  title,
  titleTanglish,
  "slug": slug.current,
  year,
  director,
  cast,
  genre,
  rating,
  poster,
  posterUrl,
  backdropUrl,
  synopsis,
  ottPlatform,
  tmdbId
}`

export const latestBlogsQuery = `*[_type == "blog"] | order(publishedAt desc, _createdAt desc)[0...6] {
  _id,
  title,
  "slug": slug.current,
  author,
  publishedAt,
  category,
  mainImage,
  excerpt,
  tags
}`

export const allMoviesQuery = `*[_type == "movie"] | order(year desc) {
  _id,
  title,
  titleTanglish,
  "slug": slug.current,
  year,
  director,
  cast,
  genre,
  rating,
  poster,
  posterUrl,
  backdropUrl,
  synopsis,
  ottPlatform,
  tmdbId
}`

export const allBlogsQuery = `*[_type == "blog"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  author,
  publishedAt,
  category,
  mainImage,
  excerpt,
  tags
}`

export const movieBySlugQuery = `*[_type == "movie" && slug.current == $slug][0] {
  _id,
  title,
  titleTanglish,
  "slug": slug.current,
  year,
  director,
  cast,
  genre,
  rating,
  poster,
  posterUrl,
  backdropUrl,
  synopsis,
  ottPlatform,
  tmdbId,
  review
}`

export const blogBySlugQuery = `*[_type == "blog" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  author,
  publishedAt,
  category,
  mainImage,
  excerpt,
  body,
  seoTitle,
  seoDescription,
  tags
}`

export const relatedBlogsQuery = `*[_type == "blog" && category == $category && slug.current != $slug] | order(publishedAt desc)[0...3] {
  _id,
  title,
  "slug": slug.current,
  author,
  publishedAt,
  category,
  mainImage,
  excerpt,
  tags
}`

export const allMovieSlugsQuery = `*[_type == "movie"].slug.current`
export const allBlogSlugsQuery = `*[_type == "blog"].slug.current`

// ── Paginated listings ────────────────────────────────────────────────────────

const MOVIE_FIELDS = `_id, title, titleTanglish, "slug": slug.current, year, director, cast, genre, rating, poster, posterUrl, backdropUrl, synopsis, ottPlatform, tmdbId`

export const paginatedMoviesQuery = (start: number, end: number) =>
  `*[_type == "movie" && ($genre == "" || $genre == "All" || $genre in genre) && ($q == "" || title match $q || titleTanglish match $q || director match $q)] | order(year desc) [${start}...${end}] { ${MOVIE_FIELDS} }`

export const moviesCountQuery =
  `count(*[_type == "movie" && ($genre == "" || $genre == "All" || $genre in genre) && ($q == "" || title match $q || titleTanglish match $q || director match $q)])`

export const allGenresQuery = `*[_type == "movie"].genre[]`

const BLOG_FIELDS = `_id, title, "slug": slug.current, author, publishedAt, category, mainImage, excerpt, tags, count(comments) as commentCount`

export const paginatedBlogsQuery = (start: number, end: number) =>
  `*[_type == "blog" && ($category == "" || $category == "All" || category == $category) && ($q == "" || title match $q || excerpt match $q || author match $q)] | order(publishedAt desc) [${start}...${end}] { ${BLOG_FIELDS} }`

export const blogsCountQuery =
  `count(*[_type == "blog" && ($category == "" || $category == "All" || category == $category) && ($q == "" || title match $q || excerpt match $q || author match $q)])`
