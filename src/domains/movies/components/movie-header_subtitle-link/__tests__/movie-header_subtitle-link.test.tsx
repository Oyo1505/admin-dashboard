/**
 * Unit tests for MovieHeaderSubtitlesButton component
 *
 * Concepts tested:
 * - Component rendering with props
 * - Link attributes (href, target, rel)
 * - Accessibility compliance (WCAG 2.2 AA)
 * - Security attributes (noreferrer, noopener)
 * - Edge cases and prop validation
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import MovieHeaderSubtitlesButton from '../movie-header_subtitle-link';

describe('MovieHeaderSubtitleLink Component', () => {
  const defaultProps = {
    subtitleWebSite: 'OpenSubtitles',
    link: 'https://www.opensubtitles.org/en/search/sublanguageid-all/moviename-test',
  };

  /**
   * Group 1: Component rendering
   */
  describe('Component rendering', () => {
    it('should render the component with correct text', () => {
      // Act
      render(<MovieHeaderSubtitlesButton {...defaultProps} />);

      // Assert
      expect(screen.getByText('OpenSubtitles')).toBeInTheDocument();
    });

    it('should render as a list item element', () => {
      // Act
      const { container } = render(
        <MovieHeaderSubtitlesButton {...defaultProps} />
      );

      // Assert
      const listItem = container.querySelector('li');
      expect(listItem).toBeInTheDocument();
    });

    it('should render an anchor element inside list item', () => {
      // Act
      render(<MovieHeaderSubtitlesButton {...defaultProps} />);

      // Assert
      const link = screen.getByRole('link', { name: 'OpenSubtitles' });
      expect(link).toBeInTheDocument();
    });

    it('should render with different subtitle website names', () => {
      // Arrange
      const testCases = [
        { subtitleWebSite: 'Subdl.org', link: 'https://subdl.org/search' },
        { subtitleWebSite: 'Yifi Subtitles', link: 'https://yifysubtitles.ch' },
        {
          subtitleWebSite: 'SubtitleCat',
          link: 'https://www.subtitlecat.com',
        },
      ];

      testCases.forEach(({ subtitleWebSite, link }) => {
        // Act
        const { unmount } = render(
          <MovieHeaderSubtitlesButton
            subtitleWebSite={subtitleWebSite}
            link={link}
          />
        );

        // Assert
        expect(screen.getByText(subtitleWebSite)).toBeInTheDocument();

        // Cleanup
        unmount();
      });
    });
  });

  /**
   * Group 2: Link attributes and functionality
   */
  describe('Link attributes', () => {
    it('should have correct href attribute', () => {
      // Act
      render(<MovieHeaderSubtitlesButton {...defaultProps} />);

      // Assert
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', defaultProps.link);
    });

    it('should open link in new tab with target="_blank"', () => {
      // Act
      render(<MovieHeaderSubtitlesButton {...defaultProps} />);

      // Assert
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should have rel="noreferrer noopener" for security', () => {
      // Act
      render(<MovieHeaderSubtitlesButton {...defaultProps} />);

      // Assert
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    });

    it('should handle different URL formats', () => {
      // Arrange
      const testUrls = [
        'https://www.opensubtitles.org/en/search/sublanguageid-all/moviename-test',
        'https://subdl.org/search/?srcname=test',
        'https://yifysubtitles.ch/movie-imdb/tt1234567',
        'https://www.subtitlecat.com/index.php?search=test',
      ];

      testUrls.forEach((url) => {
        // Act
        const { unmount } = render(
          <MovieHeaderSubtitlesButton subtitleWebSite="Test Site" link={url} />
        );

        // Assert
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', url);

        // Cleanup
        unmount();
      });
    });

    it('should apply correct CSS classes', () => {
      // Act
      render(<MovieHeaderSubtitlesButton {...defaultProps} />);

      // Assert
      const link = screen.getByRole('link');
      expect(link).toHaveClass('py-1', 'px-2', 'border-1', 'rounded-sm');
    });
  });

  /**
   * Group 3: Accessibility compliance (WCAG 2.2 AA)
   */
  describe('Accessibility', () => {
    it('should have accessible name from link text', () => {
      // Act
      render(<MovieHeaderSubtitlesButton {...defaultProps} />);

      // Assert
      const link = screen.getByRole('link', { name: 'OpenSubtitles' });
      expect(link).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      // Act
      render(<MovieHeaderSubtitlesButton {...defaultProps} />);

      // Assert: Links are naturally keyboard accessible
      const link = screen.getByRole('link');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href'); // Must have href to be keyboard accessible
    });

    it('should provide clear context about external link behavior', () => {
      // Act
      render(<MovieHeaderSubtitlesButton {...defaultProps} />);

      // Assert: target="_blank" indicates new window/tab
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should not rely solely on color for information', () => {
      // Act
      const { container } = render(
        <MovieHeaderSubtitlesButton {...defaultProps} />
      );

      // Assert: Link has visible text content, not just color
      const link = container.querySelector('a');
      expect(link?.textContent).toBeTruthy();
      expect(link?.textContent?.trim()).toBe('OpenSubtitles');
    });
  });

  /**
   * Group 4: Security attributes
   */
  describe('Security', () => {
    it('should prevent referrer leakage with rel="noreferrer noopener"', () => {
      // Act
      render(<MovieHeaderSubtitlesButton {...defaultProps} />);

      // Assert
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    });

    it('should handle external links securely', () => {
      // Arrange: External subtitle sites
      const externalLinks = [
        'https://www.opensubtitles.org',
        'https://subdl.org',
        'https://yifysubtitles.ch',
        'https://www.subtitlecat.com',
      ];

      externalLinks.forEach((link) => {
        // Act
        const { unmount } = render(
          <MovieHeaderSubtitlesButton subtitleWebSite="Site" link={link} />
        );

        // Assert
        const linkElement = screen.getByRole('link');
        expect(linkElement).toHaveAttribute('rel', 'noreferrer noopener');
        expect(linkElement).toHaveAttribute('target', '_blank');

        // Cleanup
        unmount();
      });
    });
  });

  /**
   * Group 5: Edge cases and prop validation
   */
  describe('Edge cases', () => {
    it('should handle empty subtitle website name', () => {
      // Act
      render(
        <MovieHeaderSubtitlesButton
          subtitleWebSite=""
          link={defaultProps.link}
        />
      );

      // Assert: Component should render but with empty text
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link.textContent).toBe('');
    });

    it('should handle subtitle website name with special characters', () => {
      // Arrange
      const specialNames = [
        'OpenSubtitles™',
        'Subdl.org (Free)',
        'Yifi Subtitles & More',
        'SubtitleCat - Download',
      ];

      specialNames.forEach((name) => {
        // Act
        const { unmount } = render(
          <MovieHeaderSubtitlesButton
            subtitleWebSite={name}
            link={defaultProps.link}
          />
        );

        // Assert
        expect(screen.getByText(name)).toBeInTheDocument();

        // Cleanup
        unmount();
      });
    });

    it('should handle very long subtitle website names', () => {
      // Arrange
      const longName =
        'Very Long Subtitle Website Name That Could Potentially Break Layout';

      // Act
      render(
        <MovieHeaderSubtitlesButton
          subtitleWebSite={longName}
          link={defaultProps.link}
        />
      );

      // Assert
      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle URLs with query parameters', () => {
      // Arrange
      const urlWithParams =
        'https://www.opensubtitles.org/en/search?q=test&lang=en&year=2024';

      // Act
      render(
        <MovieHeaderSubtitlesButton
          subtitleWebSite="OpenSubtitles"
          link={urlWithParams}
        />
      );

      // Assert
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', urlWithParams);
    });

    it('should handle URLs with encoded characters', () => {
      // Arrange
      const encodedUrl =
        'https://subdl.org/search/?srcname=test%20movie%20title';

      // Act
      render(
        <MovieHeaderSubtitlesButton
          subtitleWebSite="Subdl.org"
          link={encodedUrl}
        />
      );

      // Assert
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', encodedUrl);
    });

    it('should handle URLs with hash fragments', () => {
      // Arrange
      const urlWithHash = 'https://www.subtitlecat.com/search#results';

      // Act
      render(
        <MovieHeaderSubtitlesButton
          subtitleWebSite="SubtitleCat"
          link={urlWithHash}
        />
      );

      // Assert
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', urlWithHash);
    });
  });

  /**
   * Group 6: Component structure
   */
  describe('Component structure', () => {
    it('should have correct HTML structure: li > a', () => {
      // Act
      const { container } = render(
        <MovieHeaderSubtitlesButton {...defaultProps} />
      );

      // Assert
      const listItem = container.querySelector('li');
      const anchor = listItem?.querySelector('a');

      expect(listItem).toBeInTheDocument();
      expect(anchor).toBeInTheDocument();
      expect(listItem?.children.length).toBe(1); // Only one child (anchor)
    });

    it('should render only one anchor element per component', () => {
      // Act
      const { container } = render(
        <MovieHeaderSubtitlesButton {...defaultProps} />
      );

      // Assert
      const anchors = container.querySelectorAll('a');
      expect(anchors).toHaveLength(1);
    });

    it('should not have nested interactive elements', () => {
      // Act
      const { container } = render(
        <MovieHeaderSubtitlesButton {...defaultProps} />
      );

      // Assert: No buttons or other links inside the anchor
      const anchor = container.querySelector('a');
      const nestedInteractive = anchor?.querySelectorAll('a, button, input');
      expect(nestedInteractive?.length).toBe(0);
    });
  });

  /**
   * Group 7: Integration scenarios
   */
  describe('Integration scenarios', () => {
    it('should work correctly when rendered multiple times', () => {
      // Arrange
      const subtitleSites = [
        { name: 'OpenSubtitles', url: 'https://www.opensubtitles.org' },
        { name: 'Subdl.org', url: 'https://subdl.org' },
        { name: 'Yifi Subtitles', url: 'https://yifysubtitles.ch' },
        { name: 'SubtitleCat', url: 'https://www.subtitlecat.com' },
      ];

      // Act
      render(
        <ul>
          {subtitleSites.map((site) => (
            <MovieHeaderSubtitlesButton
              key={site.name}
              subtitleWebSite={site.name}
              link={site.url}
            />
          ))}
        </ul>
      );

      // Assert: All buttons should be rendered
      subtitleSites.forEach((site) => {
        expect(screen.getByText(site.name)).toBeInTheDocument();
      });

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(4);
    });

    it('should maintain consistent styling across multiple instances', () => {
      // Arrange
      const instances = [
        { name: 'Site 1', url: 'https://example1.com' },
        { name: 'Site 2', url: 'https://example2.com' },
      ];

      // Act
      render(
        <ul>
          {instances.map((instance) => (
            <MovieHeaderSubtitlesButton
              key={instance.name}
              subtitleWebSite={instance.name}
              link={instance.url}
            />
          ))}
        </ul>
      );

      // Assert: All links should have same classes
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveClass('py-1', 'px-2', 'border-1', 'rounded-sm');
      });
    });
  });

  /**
   * Group 8: Rendering consistency
   */
  describe('Rendering consistency', () => {
    it('should render consistently with same props', () => {
      // Act
      const { rerender } = render(
        <MovieHeaderSubtitlesButton {...defaultProps} />
      );

      const firstRender = screen.getByRole('link');
      const firstHref = firstRender.getAttribute('href');

      // Rerender with same props
      rerender(<MovieHeaderSubtitlesButton {...defaultProps} />);

      // Assert: Should render identically
      const secondRender = screen.getByRole('link');
      expect(secondRender.getAttribute('href')).toBe(firstHref);
      expect(secondRender.textContent).toBe(defaultProps.subtitleWebSite);
    });

    it('should update correctly when props change', () => {
      // Act
      const { rerender } = render(
        <MovieHeaderSubtitlesButton {...defaultProps} />
      );

      expect(screen.getByText('OpenSubtitles')).toBeInTheDocument();

      // Rerender with different props
      rerender(
        <MovieHeaderSubtitlesButton
          subtitleWebSite="Subdl.org"
          link="https://subdl.org"
        />
      );

      // Assert: Should reflect new props
      expect(screen.getByText('Subdl.org')).toBeInTheDocument();
      expect(screen.queryByText('OpenSubtitles')).not.toBeInTheDocument();
    });
  });
});
