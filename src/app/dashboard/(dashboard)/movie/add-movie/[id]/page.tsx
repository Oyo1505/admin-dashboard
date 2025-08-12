import FormMovie from '@/domains/dashboard/components/form-movie/form-movie';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}
const Page = async (props: PageProps) => {
  const { id } = await props.params;

  return <FormMovie idFromGoogleDrive={id} />;
};

export default Page;
