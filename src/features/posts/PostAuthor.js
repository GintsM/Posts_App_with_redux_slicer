import React from 'react'

export const PostAuthor = ({ userId }) => {

  return <span>by {userId ? userId.name : 'Unknown author'}</span>
}

export const MemoAuthor = React.memo(PostAuthor)