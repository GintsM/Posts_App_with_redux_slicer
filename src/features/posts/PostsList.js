import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { MemoAuthor } from './PostAuthor'
import { ReactionButtons } from './ReactionButtons'
import { selectAllPosts, fetchPosts } from './postsSlice'
import { Spinner } from '../../components/Spinner'

const PostExcerpt = ({ post }) => {
  console.log("hey from PostExcerpt")
  return (
    <article className="post-excerpt" >
      <h3>{post.title}</h3>
      <div>
        <MemoAuthor userId={post.user.id} />
      </div>
      <p className="post-content">{post.content}</p>
      <ReactionButtons post={post} />
      <Link to={`/posts/${post.id}`} className="button muted-button">
        View Post Post id={post.id}
      </Link>
    </article>
  )
}

export const PostsList = () => {
  const posts = useSelector(selectAllPosts)
  // console.log(posts, 'posts')
  const dispatch = useDispatch()

  const postStatus = useSelector(state => state.posts.status)
  const error = useSelector(state => state.posts.error)

  console.log("hey from PostList")

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts())
    }
    console.log("hey from UseEffect")
  }, [postStatus, dispatch])

  let content

  if (postStatus === 'loading') {
    content = <Spinner text="Loading..." />
  } else if (postStatus === 'succeeded') {
    // // Sort posts in reverse chronological order by datetime string
    // const orderedPosts = posts
    //   .slice()
    //   .sort((a, b) => b.date.localeCompare(a.date))// TODO must to check this
    // console.log(content, 'content')

    content = posts.map(post => (
      <PostExcerpt post={post} key={post.id} />
    ))
  } else if (postStatus === 'failed') {
    content = <div>This is error: {error}</div>
  }

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  )
}