import { addFileToGoogleDriveAction } from '@/googleDrive';
import { useMutation } from '@tanstack/react-query';

export interface FormValues {
  file: File;
}

const useGoogleQueries = () => {
  const addFileToGoogleDrive = useMutation({
    mutationFn: (data: FormValues) => addFileToGoogleDriveAction(data.file),
  });
  return { addFileToGoogleDrive };
};
export default useGoogleQueries;
