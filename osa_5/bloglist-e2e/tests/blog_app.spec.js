const { test, expect, beforeEach, describe } = require('@playwright/test')

const loginWith = async (page, username, password) => {
  await page.getByRole('textbox').first().fill(username)
  await page.getByRole('textbox').nth(1).fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', { name: 'create new blog' }).click()
  await page.getByPlaceholder('title').fill(title)
  await page.getByPlaceholder('author').fill(author)
  await page.getByPlaceholder('url').fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  // Odota että uusi blogi tulee näkyviin (.blog-luokan elementtinä)
  await expect(page.locator('.blog', { hasText: `${title} ${author}` })).toBeVisible()
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen',
      },
    })
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Other User',
        username: 'other',
        password: 'sekret',
      },
    })

    await page.goto('http://localhost:5173')
  })

  // 5.17
  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  // 5.18
  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')

      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrongpassword')

      await expect(page.getByText('wrong username or password')).toBeVisible()
      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
    })

    // 5.19
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'New blog title', 'New blog author', 'https://example.com/new')

      await expect(page.getByText('New blog title New blog author')).toBeVisible()
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'First blog', 'Author A', 'https://a.com')
      })

      // 5.20
      test('a blog can be liked', async ({ page }) => {
        const blog = page.locator('.blog', { hasText: 'First blog Author A' })
        await blog.getByRole('button', { name: 'view' }).click()
        await expect(blog.getByText('likes 0')).toBeVisible()

        await blog.getByRole('button', { name: 'like' }).click()
        await expect(blog.getByText('likes 1')).toBeVisible()
      })

      // 5.21
      test('the user who created a blog can delete it', async ({ page }) => {
        const blog = page.locator('.blog', { hasText: 'First blog Author A' })
        await blog.getByRole('button', { name: 'view' }).click()

        page.on('dialog', (dialog) => dialog.accept())

        await blog.getByRole('button', { name: 'remove' }).click()

        await expect(page.locator('.blog', { hasText: 'First blog Author A' })).toHaveCount(0)
      })

      // 5.22
      test('only the creator sees the remove button', async ({ page }) => {
        // Logout, kirjaudu toisena käyttäjänä, varmista että remove-nappia ei ole
        await page.getByRole('button', { name: 'logout' }).click()
        await loginWith(page, 'other', 'sekret')

        const blog = page.locator('.blog', { hasText: 'First blog Author A' })
        await blog.getByRole('button', { name: 'view' }).click()

        await expect(blog.getByRole('button', { name: 'remove' })).not.toBeVisible()
      })
    })

    // 5.23
    describe('and several blogs exist', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'Least liked', 'A1', 'https://a1.com')
        await createBlog(page, 'Middle liked', 'A2', 'https://a2.com')
        await createBlog(page, 'Most liked', 'A3', 'https://a3.com')
      })

      test('blogs are ordered by likes, most liked first', async ({ page }) => {
        // Avataan kaikki kolme blogia ja painetaan likeä eri määrät
        const middleViewButton = page.locator('.blog', { hasText: 'Middle liked' }).getByRole('button', { name: 'view' })
        await middleViewButton.click()
        const middleLikeButton = page.locator('.blog', { hasText: 'Middle liked' }).getByRole('button', { name: 'like' })
        await middleLikeButton.click()
        await expect(page.locator('.blog', { hasText: 'Middle liked' }).getByText('likes 1')).toBeVisible()
        await middleLikeButton.click()
        await expect(page.locator('.blog', { hasText: 'Middle liked' }).getByText('likes 2')).toBeVisible()

        const topViewButton = page.locator('.blog', { hasText: 'Most liked' }).getByRole('button', { name: 'view' })
        await topViewButton.click()
        const topLikeButton = page.locator('.blog', { hasText: 'Most liked' }).getByRole('button', { name: 'like' })
        await topLikeButton.click()
        await expect(page.locator('.blog', { hasText: 'Most liked' }).getByText('likes 1')).toBeVisible()
        await topLikeButton.click()
        await expect(page.locator('.blog', { hasText: 'Most liked' }).getByText('likes 2')).toBeVisible()
        await topLikeButton.click()
        await expect(page.locator('.blog', { hasText: 'Most liked' }).getByText('likes 3')).toBeVisible()

        // Tarkista järjestys: Most liked ensin, Middle, Least viimeisenä
        const blogTitles = await page.locator('.blog').allTextContents()
        const order = blogTitles.map((t) => {
          if (t.includes('Most liked')) return 'most'
          if (t.includes('Middle liked')) return 'middle'
          if (t.includes('Least liked')) return 'least'
          return 'unknown'
        })

        expect(order[0]).toBe('most')
        expect(order[1]).toBe('middle')
        expect(order[2]).toBe('least')
      })
    })
  })
})
