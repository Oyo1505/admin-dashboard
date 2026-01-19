import { act, renderHook } from '@testing-library/react';
import { useUploadStore } from '../upload-store';

describe('useUploadStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUploadStore.setState({ uploads: {} });
  });

  describe('addUpload', () => {
    it('should add a new upload with pending status', () => {
      const { result } = renderHook(() => useUploadStore());
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' });

      let uploadId: string = '';
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      const upload = result.current.uploads[uploadId];
      expect(upload).toBeDefined();
      expect(upload?.fileName).toBe('test.mp4');
      expect(upload?.fileSize).toBe(7); // 'content'.length
      expect(upload?.status).toBe('pending');
      expect(upload?.progress).toBe(0);
      expect(upload?.startedAt).toBeInstanceOf(Date);
    });

    it('should generate unique upload IDs', () => {
      const { result } = renderHook(() => useUploadStore());
      const file1 = new File(['1'], 'test1.mp4', { type: 'video/mp4' });
      const file2 = new File(['2'], 'test2.mp4', { type: 'video/mp4' });

      let id1: string = '';
      let id2: string = '';
      act(() => {
        id1 = result.current.addUpload(file1);
        id2 = result.current.addUpload(file2);
      });

      expect(id1).not.toBe(id2);
      expect(Object.keys(result.current.uploads).length).toBe(2);
    });
  });

  describe('updateProgress', () => {
    it('should update progress and set status to uploading', () => {
      const { result } = renderHook(() => useUploadStore());
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' });

      let uploadId: string = '';
      act(() => {
        uploadId = result.current.addUpload(file);
        result.current.updateProgress(uploadId, 50);
      });

      const upload = result.current.uploads[uploadId];
      expect(upload?.progress).toBe(50);
      expect(upload?.status).toBe('uploading');
    });

    it('should clamp progress to 0-100 range', () => {
      const { result } = renderHook(() => useUploadStore());
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' });

      let uploadId: string = '';
      act(() => {
        uploadId = result.current.addUpload(file);
        result.current.updateProgress(uploadId, 150);
      });

      expect(result.current.uploads[uploadId]?.progress).toBe(100);

      act(() => {
        result.current.updateProgress(uploadId, -10);
      });

      expect(result.current.uploads[uploadId]?.progress).toBe(0);
    });

    it('should not update non-existent upload', () => {
      const { result } = renderHook(() => useUploadStore());

      act(() => {
        result.current.updateProgress('non-existent-id', 50);
      });

      expect(Object.keys(result.current.uploads).length).toBe(0);
    });
  });

  describe('setStatus', () => {
    it('should update status and set completedAt for terminal states', () => {
      const { result } = renderHook(() => useUploadStore());
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' });

      let uploadId: string = '';
      act(() => {
        uploadId = result.current.addUpload(file);
        result.current.setStatus(uploadId, 'failed', 'Network error');
      });

      const upload = result.current.uploads[uploadId];
      expect(upload?.status).toBe('failed');
      expect(upload?.error).toBe('Network error');
      expect(upload?.completedAt).toBeInstanceOf(Date);
    });

    it('should not set completedAt for non-terminal states', () => {
      const { result } = renderHook(() => useUploadStore());
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' });

      let uploadId: string = '';
      act(() => {
        uploadId = result.current.addUpload(file);
        result.current.setStatus(uploadId, 'uploading');
      });

      const upload = result.current.uploads[uploadId];
      expect(upload?.status).toBe('uploading');
      expect(upload?.completedAt).toBeUndefined();
    });
  });

  describe('completeUpload', () => {
    it('should mark upload as completed with result', () => {
      const { result } = renderHook(() => useUploadStore());
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' });
      const mockResult = {
        fileId: 'file-123',
        name: 'test.mp4',
        webViewLink: 'https://drive.google.com/view',
      };

      let uploadId: string = '';
      act(() => {
        uploadId = result.current.addUpload(file);
        result.current.completeUpload(uploadId, mockResult);
      });

      const upload = result.current.uploads[uploadId];
      expect(upload?.status).toBe('completed');
      expect(upload?.progress).toBe(100);
      expect(upload?.result).toEqual(mockResult);
      expect(upload?.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('removeUpload', () => {
    it('should remove an upload from the store', () => {
      const { result } = renderHook(() => useUploadStore());
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' });

      let uploadId: string = '';
      act(() => {
        uploadId = result.current.addUpload(file);
      });

      expect(Object.keys(result.current.uploads).length).toBe(1);

      act(() => {
        result.current.removeUpload(uploadId);
      });

      expect(Object.keys(result.current.uploads).length).toBe(0);
    });
  });

  describe('clearCompleted', () => {
    it('should remove all completed and failed uploads', () => {
      const { result } = renderHook(() => useUploadStore());
      const file1 = new File(['1'], 'test1.mp4', { type: 'video/mp4' });
      const file2 = new File(['2'], 'test2.mp4', { type: 'video/mp4' });
      const file3 = new File(['3'], 'test3.mp4', { type: 'video/mp4' });

      act(() => {
        const id1 = result.current.addUpload(file1);
        const id2 = result.current.addUpload(file2);
        const id3 = result.current.addUpload(file3);

        result.current.completeUpload(id1, { fileId: '1', name: 'test1.mp4' });
        result.current.setStatus(id2, 'failed', 'Error');
        result.current.updateProgress(id3, 50);
      });

      expect(Object.keys(result.current.uploads).length).toBe(3);

      act(() => {
        result.current.clearCompleted();
      });

      expect(Object.keys(result.current.uploads).length).toBe(1);
      const remaining = Object.values(result.current.uploads)[0];
      expect(remaining.status).toBe('uploading');
    });
  });

  describe('getActiveUploads', () => {
    it('should return only pending and uploading uploads', () => {
      const { result } = renderHook(() => useUploadStore());
      const file1 = new File(['1'], 'test1.mp4', { type: 'video/mp4' });
      const file2 = new File(['2'], 'test2.mp4', { type: 'video/mp4' });
      const file3 = new File(['3'], 'test3.mp4', { type: 'video/mp4' });
      const file4 = new File(['4'], 'test4.mp4', { type: 'video/mp4' });

      act(() => {
        const id1 = result.current.addUpload(file1); // pending
        const id2 = result.current.addUpload(file2);
        result.current.updateProgress(id2, 50); // uploading
        const id3 = result.current.addUpload(file3);
        result.current.completeUpload(id3, { fileId: '3', name: 'test3.mp4' }); // completed
        const id4 = result.current.addUpload(file4);
        result.current.setStatus(id4, 'failed', 'Error'); // failed
      });

      const activeUploads = result.current.getActiveUploads();
      expect(activeUploads).toHaveLength(2);
      expect(activeUploads.map((u) => u.status).sort()).toEqual([
        'pending',
        'uploading',
      ]);
    });
  });

  describe('hasActiveUploads', () => {
    it('should return true when there are active uploads', () => {
      const { result } = renderHook(() => useUploadStore());
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' });

      expect(result.current.hasActiveUploads()).toBe(false);

      act(() => {
        result.current.addUpload(file);
      });

      expect(result.current.hasActiveUploads()).toBe(true);
    });

    it('should return false when all uploads are completed', () => {
      const { result } = renderHook(() => useUploadStore());
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' });

      let uploadId: string = '';
      act(() => {
        uploadId = result.current.addUpload(file);
        result.current.completeUpload(uploadId, { fileId: '1', name: 'test.mp4' });
      });

      expect(result.current.hasActiveUploads()).toBe(false);
    });
  });
});
