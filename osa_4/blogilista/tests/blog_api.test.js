const { test, after, beforeEach, describe, before } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

let token
let testUser

before(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  testUser = await new User({ username: 'tester', name: 'Tester', passwordHash }).save()

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'tester', password: 'sekret' })

  token = loginResponse.body.token
})

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogsWithUser = helper.initialBlogs.map((b) => ({ ...b, user: testUser._id }))
  await Blog.insertMany(blogsWithUser)
})

describe('when there are some blogs initially', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier is named id', async () => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]
    assert.ok(blog.id, 'id field should exist')
    assert.strictEqual(blog._id, undefined, '_id should not be present')
  })
})

describe('addition of a new blog', () => {
  test('a valid blog can be added with valid token', async () => {
    const newBlog = {
      title: 'Async/Await — best practices',
      author: 'Joonas',
      url: 'https://example.com/async-await',
      likes: 5,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map((b) => b.title)
    assert.ok(titles.includes('Async/Await — best practices'))
  })

  // 4.23
  test('adding a blog without token returns 401', async () => {
    const newBlog = {
      title: 'No token blog',
      author: 'Anon',
      url: 'https://example.com/no-token',
      likes: 1,
    }

    const result = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    assert.match(result.body.error, /token/i)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('if likes is missing, it defaults to 0', async () => {
    const newBlog = {
      title: 'No likes blog',
      author: 'Anon',
      url: 'https://example.com/no-likes',
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('if title is missing, responds with 400', async () => {
    const newBlog = {
      author: 'Anon',
      url: 'https://example.com/no-title',
      likes: 1,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })

  test('if url is missing, responds with 400', async () => {
    const newBlog = {
      title: 'No url blog',
      author: 'Anon',
      likes: 1,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })
})

describe('deletion of a blog', () => {
  test('a blog can be deleted with status 204 by its creator', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map((b) => b.title)
    assert.ok(!titles.includes(blogToDelete.title))
  })

  test('deletion without token returns 401', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('updating a blog', () => {
  test('likes of an existing blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updated = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 100,
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updated)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 100)
  })
})

after(async () => {
  await mongoose.connection.close()
})
