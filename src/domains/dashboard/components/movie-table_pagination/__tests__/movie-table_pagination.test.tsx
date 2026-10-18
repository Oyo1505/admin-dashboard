import { fireEvent, render, screen } from '@testing-library/react';
import MovieTablePagination from '../movie-table_pagination';

const renderPagination = (
  props: Partial<React.ComponentProps<typeof MovieTablePagination>> = {}
) => {
  const onPageChange = jest.fn();
  const view = render(
    <MovieTablePagination
      page={0}
      totalPages={3}
      isPlaceholderData={false}
      onPageChange={onPageChange}
      {...props}
    />
  );
  return { onPageChange, ...view };
};

describe('MovieTablePagination', () => {
  it('should render nothing when there is a single page', () => {
    const { container } = renderPagination({ totalPages: 1 });

    expect(container).toBeEmptyDOMElement();
  });

  it('should be a labelled navigation landmark', () => {
    renderPagination();

    expect(
      screen.getByRole('navigation', { name: 'paginationLabel' })
    ).toBeInTheDocument();
    expect(screen.getByText('pageIndicator')).toBeInTheDocument();
  });

  it('should disable previous on the first page', () => {
    const { onPageChange } = renderPagination();

    expect(screen.getByRole('button', { name: 'previousPage' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'nextPage' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should disable next on the last page', () => {
    const { onPageChange } = renderPagination({ page: 2 });

    expect(screen.getByRole('button', { name: 'nextPage' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'previousPage' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should disable next while placeholder data is shown', () => {
    renderPagination({ isPlaceholderData: true });

    expect(screen.getByRole('button', { name: 'nextPage' })).toBeDisabled();
  });
});
