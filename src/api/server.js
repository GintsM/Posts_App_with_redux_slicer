import { rest, setupWorker } from 'msw'
import { factory, oneOf, manyOf, primaryKey } from '@mswjs/data'
import { nanoid } from '@reduxjs/toolkit'
// import faker from 'faker'
import seedrandom from 'seedrandom'
import { Server as MockSocketServer } from 'mock-socket'
import { setRandom } from 'txtgen'
import { LoremIpsum } from "lorem-ipsum";

import { parseISO } from 'date-fns'

const NUM_USERS = 3 // don't change - limited amount to 3 check usersSeed to add more if neccesary
const POSTS_PER_USER = 3
// const RECENT_NOTIFICATIONS_DAYS = 7

// Add an extra delay to all endpoints, so loading spinners show up.
const ARTIFICIAL_DELAY_MS = 2000


/* MSW Data Model Setup */

export const db = factory({
  user: {
    // pk: primaryKey(nanoid),
    id: primaryKey(String),
    firstName: String,
    lastName: String,
    name: String,
    username: String,
    posts: manyOf('post'),
  },
  post: {
    id: primaryKey(nanoid),
    title: String,
    date: String,
    content: String,
    reactions: oneOf('reaction'),
    comments: manyOf('comment'),
    user: oneOf('user'),
  },
  comment: {
    id: primaryKey(String),
    date: String,
    text: String,
    post: oneOf('post'),
  },
  reaction: {
    id: primaryKey(nanoid),
    thumbsUp: Number,
    hooray: Number,
    heart: Number,
    rocket: Number,
    eyes: Number,
    post: oneOf('post'),
  },
})

const usersSeed = [
  { id: nanoid(), firstName: 'akbar (Aku)', lastName: 'Khan', username: 'Aku' },
  { id: nanoid(), firstName: 'Gints', lastName: 'Misins', username: 'GintsM' },
  { id: nanoid(), firstName: 'Zachee', lastName: 'Ishimwe', username: 'Zacheee' }
]

const createUserData = (index) => {
  const firstName = usersSeed[index].firstName
  const lastName = usersSeed[index].lastName

  return {
    id: usersSeed[index].id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    username: usersSeed[index].username,
  }
}

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 6,
    min: 2
  },
  wordsPerSentence: {
    max: 10,
    min: 3
  }
});

const createPostData = (user) => {
  function getRandomDate(startDate, endDate) {
    const minValue = startDate.getTime();
    const maxValue = endDate.getTime();
    const timestamp = Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
    return new Date(timestamp);
  }
  const randomDate = getRandomDate(new Date(2020, 0, 1), new Date(2022, 8, 31))

  return {
    title: lorem.generateWords(2),
    date: randomDate,
    user,
    content: lorem.generateParagraphs(2),
    reactions: db.reaction.create(),
  }
}

// Create an initial set of users and posts
for (let i = 0; i < NUM_USERS; i++) {
  const author = db.user.create(createUserData(i)) // TODO pass users in createUserData


  for (let j = 0; j < POSTS_PER_USER; j++) {

    const newPost = createPostData(author)
    db.post.create(newPost)
    if (i === 2 && j === 2) {
      console.log(author, "Author from creat")
    }
  }
}

const serializePost = (post) => ({
  ...post,
  // user: post.user.id,
})

/* MSW REST API Handlers */

export const handlers = [
  rest.get('/fakeApi/posts', function (req, res, ctx) {
    const posts = db.post.getAll().map(serializePost)
    return res(ctx.delay(ARTIFICIAL_DELAY_MS), ctx.json(posts))
  }),
  rest.post('/fakeApi/posts', (req, res, ctx) => {
    const data = req.json() // changed req.body is depraceted

    if (data.content === 'error') {
      return res(
        ctx.delay(ARTIFICIAL_DELAY_MS),
        ctx.status(500),
        ctx.json('Server error saving this post!')
      )
    }

    const createPostFromData = (post) => {
      const userFromDb = db.user.getAll().find((user) => user.id === post.user)

      return {
        title: post.title,
        date: new Date().toISOString(),//DONE
        user: userFromDb,
        content: post.content,
        reactions: db.reaction.create(),//DONE
      }
    }

    data.then((result) => {
      db.post.create(createPostFromData(result))
    }
    )

    return res(ctx.delay(ARTIFICIAL_DELAY_MS), ctx.json('Great'))
  }),
  rest.get('/fakeApi/posts/:postId', function (req, res, ctx) {
    const post = db.post.findFirst({
      where: { id: { equals: req.params.postId } },
    })
    return res(ctx.delay(ARTIFICIAL_DELAY_MS), ctx.json(serializePost(post)))
  }),
  rest.patch('/fakeApi/posts/:postId', (req, res, ctx) => {
    const { id, ...data } = req.json()
    const updatedPost = db.post.update({
      where: { id: { equals: req.params.postId } },
      data,
    })
    return res(
      ctx.delay(ARTIFICIAL_DELAY_MS),
      ctx.json(serializePost(updatedPost))
    )
  }),

  rest.get('/fakeApi/posts/:postId/comments', (req, res, ctx) => {
    const post = db.post.findFirst({
      where: { id: { equals: req.params.postId } },
    })
    return res(
      ctx.delay(ARTIFICIAL_DELAY_MS),
      ctx.json({ comments: post.comments })
    )
  }),

  rest.post('/fakeApi/posts/:postId/reactions', (req, res, ctx) => {
    const postId = req.params.postId
    const reaction = req.body.reaction
    const post = db.post.findFirst({
      where: { id: { equals: postId } },
    })

    const updatedPost = db.post.update({
      where: { id: { equals: postId } },
      data: {
        reactions: {
          ...post.reactions,
          [reaction]: (post.reactions[reaction] += 1),
        },
      },
    })

    return res(
      ctx.delay(ARTIFICIAL_DELAY_MS),
      ctx.json(serializePost(updatedPost))
    )
  }),
  rest.get('/fakeApi/notifications', (req, res, ctx) => {
    const numNotifications = 2 // REPLACED getRandomInt(1, 5)

    let notifications = generateRandomNotifications(
      undefined,
      numNotifications,
      db
    )

    return res(ctx.delay(ARTIFICIAL_DELAY_MS), ctx.json(notifications))
  }),
  rest.get('/fakeApi/users', (req, res, ctx) => {
    return res(ctx.delay(ARTIFICIAL_DELAY_MS), ctx.json(db.user.getAll()))
  }),
]

export const worker = setupWorker(...handlers)
// worker.printHandlers() // Optional: nice for debugging to see all available route handlers that will be intercepted

/* RNG setup for Notifications*/

// Set up a seeded random number generator, so that we get
// a consistent set of users / entries each time the page loads.
// This can be reset by deleting this localStorage value,
// or turned off by setting `useSeededRNG` to false.
let useSeededRNG = false

let rng = seedrandom()

if (useSeededRNG) {
  let randomSeedString = localStorage.getItem('randomTimestampSeed')
  let seedDate

  if (randomSeedString) {
    seedDate = new Date(randomSeedString)
  } else {
    seedDate = new Date()
    randomSeedString = seedDate.toISOString()
    localStorage.setItem('randomTimestampSeed', randomSeedString)
  }

  rng = seedrandom(randomSeedString)
  setRandom(rng)
  // faker.seed(seedDate.getTime())
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(rng() * (max - min + 1)) + min
}

const randomFromArray = (array) => {
  const index = getRandomInt(0, array.length - 1)
  return array[index]
}

/* Mock Websocket Setup */

const socketServer = new MockSocketServer('ws://localhost')

let currentSocket

const sendMessage = (socket, obj) => {
  socket.send(JSON.stringify(obj))
}

// Allow our UI to fake the server pushing out some notifications over the websocket,
// as if other users were interacting with the system.
const sendRandomNotifications = (socket, since) => {
  const numNotifications = getRandomInt(1, 5)

  const notifications = generateRandomNotifications(since, numNotifications, db)

  sendMessage(socket, { type: 'notifications', payload: notifications })
}

export const forceGenerateNotifications = (since) => {
  sendRandomNotifications(currentSocket, since)
}

socketServer.on('connection', (socket) => {
  currentSocket = socket

  socket.on('message', (data) => {
    const message = JSON.parse(data)

    switch (message.type) {
      case 'notifications': {
        const since = message.payload
        sendRandomNotifications(socket, since)
        break
      }
      default:
        break
    }
  })
})

/* Random Notifications Generation */

const notificationTemplates = [
  'poked you',
  'says hi!',
  `is glad we're friends`,
  'sent you a gift',
]

function generateRandomNotifications(since, numNotifications, db) {
  const now = new Date()
  let pastDate

  if (since) {
    pastDate = parseISO(since)
  } else {
    pastDate = new Date(now.valueOf())
    pastDate.setMinutes(pastDate.getMinutes() - 15)
  }

  // Create N random notifications. We won't bother saving these
  // in the DB - just generate a new batch and return them.
  const notifications = [...Array(numNotifications)].map(() => {
    const user = randomFromArray(db.user.getAll())
    const template = randomFromArray(notificationTemplates)
    return {
      id: nanoid(),
      // TODO must replace faker with proper data
      // date: faker.date.between(pastDate, now).toISOString(), 
      message: template,
      user: user.id,
    }
  })

  return notifications
}
