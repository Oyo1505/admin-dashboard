'use client';
import { Button } from '@/domains/ui/components/button/button';
import { Textarea } from '@/domains/ui/components/textarea/textarea';
import { suggestionSchema } from '@/shared/schema/dashboardShema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { sendEmail } from '../../action';

type Topic = {
  value: string;
  label: {
    en: string;
    fr: string;
    jp: string;
  };
};

const topicOptions: Topic[] = [
  {
    value: '1',
    label: {
      en: 'I have a problem',
      fr: "J'ai un problème",
      jp: '問題があります',
    },
  },
  {
    value: '2',
    label: {
      en: 'I have a suggestion',
      fr: "J'ai une suggestion",
      jp: '提案があります',
    },
  },
];

const SuggestionForm = () => {
  const locale = useLocale();
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      topic: '',
      message: '',
      emailUser: session?.user?.email ?? '',
    },
    resolver: zodResolver(suggestionSchema),
  });

  const onSubmit = async (data: {
    topic: string;
    message: string;
    emailUser: string;
  }) => {
    // @ts-ignore:next-line
    const topic = topicOptions.find((option) => option.value === data.topic)
      ?.label[locale];

    const result = await sendEmail({
      message: data.message,
      topic: topic,
      emailUser: session?.user?.email ?? '',
    });
    if (result.status === 200) {
      toast.success('Email sent successfully');
    } else {
      toast.error('Email not sent');
    }
  };
  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('topic', e.target.value);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-8 w-full"
      >
        <div className="flex flex-col gap-2 w-full">
          <select
            className="border-2 w-full border-white text-black bg-white rounded-md p-2 md:w-1/2 cursor-pointer [&>option]:bg-white [&>option]:text-black"
            {...register('topic', {
              required: true,
              onChange: handleTopicChange,
            })}
          >
            {topicOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label[locale as keyof typeof option.label]}
              </option>
            ))}
          </select>
          {errors.topic && (
            <p className="text-red-500">{errors.topic.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Textarea
            className="focus:outline-none h-20 md:h-48 md:w-1/2"
            {...register('message', {
              required: true,
            })}
            placeholder="Message"
          />
          {errors.message && (
            <p className="text-red-500">{errors.message.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-white text-black rounded-md p-2 md:w-1/2"
        >
          Submit
        </Button>
      </form>
    </>
  );
};

export default SuggestionForm;
