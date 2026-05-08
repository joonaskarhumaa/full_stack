const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  const top = blogs.reduce((best, current) => {
    return current.likes > best.likes ? current : best
  })

  return {
    title: top.title,
    author: top.author,
    likes: top.likes,
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const counts = {}
  for (const blog of blogs) {
    counts[blog.author] = (counts[blog.author] || 0) + 1
  }

  const top = Object.entries(counts).reduce((best, current) => {
    return current[1] > best[1] ? current : best
  })

  return {
    author: top[0],
    blogs: top[1],
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const sums = {}
  for (const blog of blogs) {
    sums[blog.author] = (sums[blog.author] || 0) + blog.likes
  }

  const top = Object.entries(sums).reduce((best, current) => {
    return current[1] > best[1] ? current : best
  })

  return {
    author: top[0],
    likes: top[1],
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
