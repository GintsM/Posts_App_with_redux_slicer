import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PostsList } from './features/posts/PostsList'
import { AddPostForm } from './features/posts/AddPostForm'
import { SinglePostPage } from './features/posts/SinglePostPage'
import { Navbar } from './app/Navbar'
import { EditPostForm } from './features/posts/EditPostForm'

function App() {
  const First = () =>
    <>
      <PostsList />
      <AddPostForm />
    </>
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<First />} />
        <Route path="/posts/:postId" element={<SinglePostPage />} />
        <Route path="/editPost/:postId" element={<EditPostForm />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
