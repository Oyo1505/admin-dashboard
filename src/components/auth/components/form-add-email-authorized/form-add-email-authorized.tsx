'use client'
import { Button } from '@/components/ui/components/button/button'
import { Input } from '@/components/ui/components/input/input'
import React from 'react'
import { postAuthorizedEmail } from '../../action/action'

const FormAddEmailAuthrizedEmail = () => {
  const [email, setEmail] = React.useState('')

  const postAuthorizedEmailForm = async () => {
    const {status} = await postAuthorizedEmail(email)
    if(status === 200){
      return setEmail('')
    }
  }
  return (
    <form>
      <Input placeholder='Email' type='email' value={email} onChange={(e)=> setEmail(e.target.value)} className='w-full mb-4' />
      <Button formAction={postAuthorizedEmailForm} className='w-full mb-4'>Add</Button>
    </form>
  )
}

export default FormAddEmailAuthrizedEmail