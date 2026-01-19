import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import ButtonAddMovie from '../button-add-movie';

// Mock translations
const messages = {
  Upload: {
    selectFile: 'Sélectionner un fichier',
    dropzone: 'Glissez-déposez ou cliquez',
    dropzoneHint: 'Fichier MP4 uniquement',
    supportedFormats: 'Formats supportés: MP4',
    dragActive: 'Déposez le fichier ici',
    changeFile: 'Changer de fichier',
    uploadButton: 'Téléverser',
    uploadingButton: 'Téléversement en cours...',
    uploadSuccess: 'Fichier téléversé avec succès',
    uploadError: 'Erreur lors du téléversement',
  },
};

// Mock the upload hook
const mockUpload = jest.fn();
jest.mock('../../../hooks/useUploadToGoogleDrive', () => ({
  useUploadToGoogleDrive: () => ({
    upload: mockUpload,
    isUploading: false,
  }),
}));

// Mock the upload store
const mockUseUploadStore = jest.fn();
jest.mock('@/store/upload/upload-store', () => ({
  useUploadStore: (selector: (state: any) => any) =>
    mockUseUploadStore(selector),
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Helper to render component with providers
const renderButtonAddMovie = () => {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <ButtonAddMovie />
    </NextIntlClientProvider>
  );
};

// Helper to create a mock File
const createMockFile = (
  name: string = 'test-movie.mp4',
  size: number = 1024 * 1024,
  type: string = 'video/mp4'
): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Helper to simulate file selection
const selectFile = (
  fileInput: HTMLInputElement,
  file: File
): void => {
  Object.defineProperty(fileInput, 'files', {
    value: [file],
    writable: false,
  });
  fireEvent.change(fileInput);
};

describe('ButtonAddMovie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no active uploads
    mockUseUploadStore.mockImplementation((selector) =>
      selector({ uploads: {} })
    );
  });

  describe('Rendering', () => {
    it('should render the dropzone with default state', () => {
      renderButtonAddMovie();

      expect(screen.getByText('dropzone')).toBeInTheDocument();
      expect(screen.getByText('dropzoneHint')).toBeInTheDocument();
      expect(screen.getByText('supportedFormats')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /selectFile/i })
      ).toBeInTheDocument();
    });

    it('should render the upload button disabled when no file selected', () => {
      renderButtonAddMovie();

      const submitButton = screen.getByRole('button', {
        name: /uploadButton/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it('should have correct accessibility attributes', () => {
      renderButtonAddMovie();

      const dropzone = screen.getByRole('button', { name: /selectFile/i });
      expect(dropzone).toHaveAttribute('aria-label', 'selectFile');
      expect(dropzone).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('File Selection', () => {
    it('should display file info when file is selected via input', async () => {
      renderButtonAddMovie();

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = createMockFile('test-movie.mp4', 5 * 1024 * 1024);

      selectFile(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('test-movie.mp4')).toBeInTheDocument();
      });
      expect(screen.getByText('5.0 MB')).toBeInTheDocument();
    });

    it('should enable upload button when file is selected', async () => {
      renderButtonAddMovie();

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = createMockFile();

      selectFile(fileInput, file);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', {
          name: /uploadButton/i,
        });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should show clear button when file is selected', async () => {
      renderButtonAddMovie();

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = createMockFile();

      selectFile(fileInput, file);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /changeFile/i })
        ).toBeInTheDocument();
      });
    });

    it('should clear file when clear button is clicked', async () => {
      renderButtonAddMovie();

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = createMockFile('test-movie.mp4');

      selectFile(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('test-movie.mp4')).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /changeFile/i });
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText('test-movie.mp4')).not.toBeInTheDocument();
      });
      expect(screen.getByText('dropzone')).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should show drag active state on drag over', () => {
      renderButtonAddMovie();

      const dropzone = screen.getByRole('button', { name: /selectFile/i });

      fireEvent.dragOver(dropzone, {
        dataTransfer: { files: [] },
      });

      expect(screen.getByText('dragActive')).toBeInTheDocument();
    });

    it('should reset drag state on drag leave', () => {
      renderButtonAddMovie();

      const dropzone = screen.getByRole('button', { name: /selectFile/i });

      fireEvent.dragOver(dropzone, { dataTransfer: { files: [] } });
      expect(screen.getByText('dragActive')).toBeInTheDocument();

      fireEvent.dragLeave(dropzone, { dataTransfer: { files: [] } });
      expect(screen.getByText('dropzone')).toBeInTheDocument();
    });

    it('should accept dropped mp4 file', async () => {
      renderButtonAddMovie();

      const dropzone = screen.getByRole('button', { name: /selectFile/i });
      const file = createMockFile('dropped-movie.mp4');

      const dataTransfer = {
        files: [file],
        items: [{ kind: 'file', type: 'video/mp4', getAsFile: () => file }],
        types: ['Files'],
      };

      fireEvent.drop(dropzone, { dataTransfer });

      await waitFor(() => {
        expect(screen.getByText('dropped-movie.mp4')).toBeInTheDocument();
      });
    });
  });

  describe('Upload Submission', () => {
    it('should call upload when form is submitted', async () => {
      renderButtonAddMovie();

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = createMockFile('submit-test.mp4');

      selectFile(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('submit-test.mp4')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /uploadButton/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith(expect.any(File));
      });
    });

    it('should reset form after successful upload', async () => {
      renderButtonAddMovie();

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = createMockFile('reset-test.mp4');

      selectFile(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('reset-test.mp4')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /uploadButton/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('dropzone')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable dropzone when upload is active', () => {
      mockUseUploadStore.mockImplementation((selector) =>
        selector({
          uploads: {
            'upload-1': { status: 'uploading' },
          },
        })
      );

      renderButtonAddMovie();

      const dropzone = screen.getByRole('button', { name: /selectFile/i });
      expect(dropzone).toHaveAttribute('aria-disabled', 'true');
    });

    it('should detect active uploads via selector', () => {
      // Verify the selector logic works correctly
      const selector = (state: { uploads: Record<string, { status: string }> }) =>
        Object.values(state.uploads).some(
          (u) => u.status === 'pending' || u.status === 'uploading'
        );

      expect(selector({ uploads: {} })).toBe(false);
      expect(
        selector({ uploads: { 'upload-1': { status: 'completed' } } })
      ).toBe(false);
      expect(
        selector({ uploads: { 'upload-1': { status: 'uploading' } } })
      ).toBe(true);
      expect(
        selector({ uploads: { 'upload-1': { status: 'pending' } } })
      ).toBe(true);
    });
  });

  describe('File Size Formatting', () => {
    it('should display bytes for small files', async () => {
      renderButtonAddMovie();

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = createMockFile('tiny.mp4', 512);

      selectFile(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('512 B')).toBeInTheDocument();
      });
    });

    it('should display KB for kilobyte files', async () => {
      renderButtonAddMovie();

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = createMockFile('small.mp4', 2048);

      selectFile(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('2.0 KB')).toBeInTheDocument();
      });
    });

    it('should display MB for megabyte files', async () => {
      renderButtonAddMovie();

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = createMockFile('medium.mp4', 5 * 1024 * 1024);

      selectFile(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('5.0 MB')).toBeInTheDocument();
      });
    });

    it('should display GB for gigabyte files', async () => {
      renderButtonAddMovie();

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = createMockFile('large.mp4', 2.5 * 1024 * 1024 * 1024);

      selectFile(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('2.50 GB')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should open file dialog on Enter key', () => {
      renderButtonAddMovie();

      const dropzone = screen.getByRole('button', { name: /selectFile/i });
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      const clickSpy = jest.spyOn(fileInput, 'click');

      fireEvent.keyDown(dropzone, { key: 'Enter' });

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should open file dialog on Space key', () => {
      renderButtonAddMovie();

      const dropzone = screen.getByRole('button', { name: /selectFile/i });
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      const clickSpy = jest.spyOn(fileInput, 'click');

      fireEvent.keyDown(dropzone, { key: ' ' });

      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
