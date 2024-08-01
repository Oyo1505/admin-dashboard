import React from 'react'

const Page = ({params}:any) => {
  const { id }= params

  return (
    <div>Page {id}</div>
  )
}

export default Page