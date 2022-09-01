import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PostsList } from './features/posts/PostsList'
import { AddPostForm } from './features/posts/AddPostForm'
import { SinglePostPage } from './features/posts/SinglePostPage'
import { Navbar } from './app/Navbar'
import { EditPostForm } from './features/posts/EditPostForm'
import { UsersList } from './features/users/Userslist'
import { UserPage } from './features/users/UsersPage'

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
        <Route path="/users" element={<UsersList />} />
        <Route path="/users/:userId" element={<UserPage />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
