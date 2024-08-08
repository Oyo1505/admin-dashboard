import { useTranslations } from 'next-intl'
import React from 'react'

const Title = ({ translationTheme, translationText, type='h1', text }: { translationTheme?: string, translationText?: string, type: string, text?: string }) => {
  const t = useTranslations(translationTheme)
  const tagType = () => {
    switch (type) {
      case 'h1':
        return <h1 className='text-3xl font-bold'>{text ? text : t(translationText)}</h1>
      case 'h2':
        return <h2 className='text-2xl font-bold'>{text ? text : t(translationText)}</h2>
      case 'h3':
        return <h3 className='text-xl font-bold'>{text ? text : t(translationText)}</h3>
      case 'h4':
        return <h4 className='text-lg font-bold'>{text ? text : t(translationText)}</h4>
      case 'h5':
        return <h5 className='text-lg font-bold'>{text ? text : t(translationText)}</h5>
      case 'h6':
        return <h6 className='text-lg font-bold'>{text ? text : t(translationText)}</h6>  
      default:
        return <h1 className='text-3xl font-bold'>{text ? text : t(translationText)}</h1>
    }
  }
  return (
    tagType()
  )
}

export default Title