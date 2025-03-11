import { IGenre } from '@/models/movie/movie'
import { GenreItem } from '../genre-item/genre-item'

export const GenreList = ({genres}: {genres? : IGenre[]}) => {
  return (<div className='flex flex-row gap-2 flex-wrap'>{genres && genres?.map(item => <GenreItem key={item.id} item={item} />)}</div>)
}
