import { useQuery } from '@tanstack/react-query';

const useGetDetailsMovie = ({id, language}: {id:string, language:string}) => {

  const { data } = useQuery({
    queryKey: ['movieDetails', id, language],
    enabled: !!id,
    refetchOnWindowFocus: false,
    queryFn: () => fetch(`https://api.themoviedb.org/3/find/${id}?external_source=imdb_id&language=${language}&api_key=${process.env.NEXT_PUBLIC_API_KEY_TMDB}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN_TMDB}`,
        Accept: 'application/json',
      },
    }).then(response => response.json()),
  });


  return { data }
}

export default useGetDetailsMovie
