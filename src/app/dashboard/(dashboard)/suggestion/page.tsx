import SuggestionForm from '@/domains/dashboard/components/suggestion-form/suggestion-form'
const Page = () => {

  return <div className='px-4 flex flex-col gap-4'>
      <h1 className='text-2xl font-bold'>Suggestion</h1>
      <SuggestionForm />
  </div>
}

export default Page
