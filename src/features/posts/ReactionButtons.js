import React from 'react'
import { useDispatch } from 'react-redux'
import { nanoid } from '@reduxjs/toolkit'

import { reactionAdded } from './postsSlice'

const reactionEmoji = {
  thumbsUp: '👍',
  hooray: '🎉',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀'
}

export const ReactionButtons = ({ post }) => {
  const dispatch = useDispatch()

  const reaction = Object.entries(reactionEmoji).map(([key, value]) => {
    const keyForElement = nanoid()
    return (
      <button
        key={keyForElement}
        type="button"
        className="muted-button reaction-button"
        onClick={() =>
          dispatch(reactionAdded({ postId: post.id, reaction: key }))
        }
      >
        {value}
        {post.reactions[key]}
      </button>
    )

  }



  )

  // const reactionButtons = Object.entries(reactionEmoji).map(([name, emoji]) => {
  //   return (
  //     <button
  //       key={name}
  //       type="button"
  //       className="muted-button reaction-button"
  //       onClick={() =>
  //         dispatch(reactionAdded({ postId: post.id, reaction: name }))
  //       }
  //     >
  //       {emoji} {post.reactions[name]}
  //     </button>
  //   )
  // <button
  //   key={key}
  //   type="button"
  //   className="muted-button reaction-button"
  //   onClick={() =>
  //     dispatch(reactionAdded({ postId: post.id, reaction: key }))
  //   }>
  // })

  return <div>
    This is
    {reaction}
  </div>
}