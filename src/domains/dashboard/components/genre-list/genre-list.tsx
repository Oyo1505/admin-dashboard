import { IGenre } from '@/models/movie/movie';
import { Activity } from 'react';
import { GenreItem } from '../genre-item/genre-item';

export const GenreList = ({ genres }: { genres?: IGenre[] }) => {
  return (
    <div className="flex flex-row gap-2 flex-wrap">
      <Activity mode={genres && genres.length > 0 ? 'visible' : 'hidden'}>
        {genres?.map((item) => (
          <GenreItem key={item.id} item={item} />
        ))}
      </Activity>
    </div>
  );
};
