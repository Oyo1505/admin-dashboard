import { fireEvent, render, screen } from '@testing-library/react';
import MovieTableToolbar from '../movie-table_toolbar';

const renderToolbar = (
  props: Partial<React.ComponentProps<typeof MovieTableToolbar>> = {}
) => {
  const handlers = { onSearchChange: jest.fn(), onPublishChange: jest.fn() };
  render(
    <MovieTableToolbar
      search=""
      publish="all"
      total={12}
      isFetching={false}
      {...handlers}
      {...props}
    />
  );
  return handlers;
};

describe('MovieTableToolbar', () => {
  it('should expose a search landmark with labelled fields', () => {
    renderToolbar();

    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByLabelText('searchLabel')).toHaveAttribute(
      'type',
      'search'
    );
    expect(screen.getByLabelText('publishFilterLabel')).toBeInTheDocument();
  });

  it('should call onSearchChange when typing', () => {
    const { onSearchChange } = renderToolbar();

    fireEvent.change(screen.getByLabelText('searchLabel'), {
      target: { value: 'ran' },
    });

    expect(onSearchChange).toHaveBeenCalledWith('ran');
  });

  it('should call onPublishChange when selecting a status', () => {
    const { onPublishChange } = renderToolbar();

    fireEvent.change(screen.getByLabelText('publishFilterLabel'), {
      target: { value: 'unpublished' },
    });

    expect(onPublishChange).toHaveBeenCalledWith('unpublished');
  });

  it('should render all publish filter options', () => {
    renderToolbar();

    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'filterAll',
      'filterPublished',
      'filterUnpublished',
    ]);
  });

  it('should announce the results count', () => {
    renderToolbar();

    expect(screen.getByRole('status')).toHaveTextContent('resultsCount');
  });

  it('should announce loading while fetching', () => {
    renderToolbar({ isFetching: true });

    expect(screen.getByRole('status')).toHaveTextContent('loading');
  });
});
