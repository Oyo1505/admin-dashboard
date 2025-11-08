const MovieHeaderSubtitleLink = ({
  subtitleWebSite,
  link,
}: {
  subtitleWebSite: string;
  link: string;
}) => {
  return (
    <li>
      <a
        href={link}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1 py-1 px-2 border-1 rounded-sm"
      >
        {subtitleWebSite}
      </a>
    </li>
  );
};

export default MovieHeaderSubtitleLink;
