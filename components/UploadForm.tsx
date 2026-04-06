'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageIcon, LoaderCircle, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { upload } from '@vercel/blob/client';
import {
  checkBookExists as checkBookExistsAction,
  createBook,
  saveBookSegments,
} from '@/lib/actions/book.actions';
import { generateSlug, parsePDFFile } from '@/lib/utils';

const MAX_PDF_SIZE = 50 * 1024 * 1024;

const isFile = (value: unknown): value is File => value instanceof File;

const isValidPdfFile = (file?: File) =>
  !file || file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

const isValidPdfSize = (file?: File) => !file || file.size <= MAX_PDF_SIZE;

const isValidCoverImage = (file?: File) => !file || file.type.startsWith('image/');

const voiceGroups = [
  {
    label: 'Male Voices',
    options: [
      {
        value: 'dave',
        title: 'Dave',
        description: 'Young male, British-Essex, casual & conversational',
      },
      {
        value: 'daniel',
        title: 'Daniel',
        description: 'Middle-aged male, British, authoritative but warm',
      },
      {
        value: 'chris',
        title: 'Chris',
        description: 'Male, casual & easy-going',
      },
    ],
  },
  {
    label: 'Female Voices',
    options: [
      {
        value: 'rachel',
        title: 'Rachel',
        description: 'Young female, American, calm & clear',
      },
      {
        value: 'sarah',
        title: 'Sarah',
        description: 'Young female, American, soft & approachable',
      },
    ],
  },
] as const;

const uploadSchema = z.object({
  pdfFile: z
    .custom<File | undefined>((value) => value === undefined || isFile(value), {
      message: 'Please upload a PDF file.',
    })
    .refine((file) => !!file, 'Please upload a PDF file.')
    .refine(isValidPdfFile, 'File must be a PDF.')
    .refine(isValidPdfSize, 'PDF must be 50MB or smaller.'),
  coverImage: z
    .custom<File | undefined>((value) => value === undefined || isFile(value), {
      message: 'Please choose a valid image file.',
    })
    .refine(isValidCoverImage, 'Cover image must be an image file.')
    .optional(),
  title: z.string().trim().min(1, 'Title is required.'),
  author: z.string().trim().min(1, 'Author name is required.'),
  voice: z.enum(['dave', 'daniel', 'chris', 'rachel', 'sarah']),
});

type UploadFormInput = z.input<typeof uploadSchema>;
type UploadFormValues = z.output<typeof uploadSchema>;

const checkBookExists = async (title: string) => checkBookExistsAction(title);

function LoadingOverlay() {
  return (
    <div className="loading-wrapper" role="alert" aria-live="assertive" aria-busy="true">
      <div className="loading-shadow-wrapper bg-white shadow-soft-lg">
        <div className="loading-shadow">
          <LoaderCircle className="loading-animation h-10 w-10 text-[#663820]" />
          <div className="space-y-2 text-center">
            <h2 className="loading-title">Synthesizing your book</h2>
            <p className="text-sm text-[#6b655e]">Uploading files and preparing the assistant voice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type UploadDropzoneProps = {
  icon: typeof Upload;
  text: string;
  hint: string;
  file?: File;
  onSelect: () => void;
  onRemove: () => void;
  onDropFile: (file: File) => void;
};

function UploadDropzone({
  icon: Icon,
  text,
  hint,
  file,
  onSelect,
  onRemove,
  onDropFile,
}: UploadDropzoneProps) {
  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      onDropFile(droppedFile);
    }
  };

  return (
    <button
      type="button"
      className={`upload-dropzone ${file ? 'upload-dropzone-uploaded' : ''}`}
      onClick={onSelect}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <Icon className="upload-dropzone-icon" />
      <span className="upload-dropzone-text">{file ? file.name : text}</span>
      <span className="upload-dropzone-hint">{file ? 'Click to replace file' : hint}</span>
      {file ? (
        <span
          className="upload-dropzone-remove"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-4 w-4" />
        </span>
      ) : null}
    </button>
  );
}

const UploadForm = () => {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useAuth();
  const router = useRouter();
  const form = useForm<UploadFormInput, unknown, UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      pdfFile: undefined,
      coverImage: undefined,
      title: '',
      author: '',
      voice: 'rachel',
    },
  });

  const pdfFile = form.watch('pdfFile');
  const coverImage = form.watch('coverImage');
  const selectedVoice = form.watch('voice');

  const setFileValue = (field: 'pdfFile' | 'coverImage', file?: File) => {
    form.setValue(field, file, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleFileChange =
    (field: 'pdfFile' | 'coverImage') => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      setFileValue(field, file);
      event.target.value = '';
    };

  const onSubmit = async (values: UploadFormValues) => {
    if (!userId) {
      return toast.error('Please sign in to upload a book.');
    }

    setIsSubmitting(true);

    // posthog -> track book upload
    try {
      const existsCheck = await checkBookExists(values.title);

      if (existsCheck.exists && existsCheck.data) {
        toast.info('Book already exists. Please check a different book.');
        form.reset();
        router.push(`/book/${existsCheck.data.slug}`);
        return;
      }

      const parsedPDF = await parsePDFFile(values.pdfFile);

      if (parsedPDF.content.length === 0) {
        toast.error('Could not extract any content from the PDF.');
        return;
      }

      const fileTitle = generateSlug(values.title) || 'book';
      const uploadedFile = await upload(`${fileTitle}.pdf`, values.pdfFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        contentType: values.pdfFile.type || 'application/pdf',
      });

      let coverUpload;

      if (values.coverImage) {
        coverUpload = await upload(`${fileTitle}_cover`, values.coverImage, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          contentType: values.coverImage.type,
        });
      } else {
        const response = await fetch(parsedPDF.cover);
        const blob = await response.blob();

        coverUpload = await upload(`${fileTitle}_cover.png`, blob, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          contentType: 'image/png',
        });
      }

      const book = await createBook({
        clerkId: userId,
        title: values.title,
        author: values.author,
        persona: values.voice,
        fileURL: uploadedFile.url,
        fileBlobKey: uploadedFile.pathname,
        coverURL: coverUpload.url,
        coverBlobKey: coverUpload.pathname,
        fileSize: values.pdfFile.size,
      });

      if (!book.success || !book.data) {
        toast.error(book.error ?? 'Failed to create book.');
        return;
      }

      if (book.alreadyExists) {
        toast.info('Book already exists. Please check a different book.');
        form.reset();
        router.push(`/book/${book.data.slug}`);
        return;
      }

      const savedSegments = await saveBookSegments(book.data._id, userId, parsedPDF.content);

      if (!savedSegments.success) {
        toast.error(savedSegments.error ?? 'Failed to save book segments.');
        return;
      }

      toast.success('Book uploaded successfully.');
      form.reset();
      router.push(`/`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting ? <LoadingOverlay /> : null}

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="pdfFile"
              render={() => (
                <FormItem>
                  <FormLabel className="form-label">Book PDF File</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <input
                        ref={pdfInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={handleFileChange('pdfFile')}
                      />
                      <UploadDropzone
                        icon={Upload}
                        text="Click to upload PDF"
                        hint="PDF file (max 50MB)"
                        file={pdfFile}
                        onSelect={() => pdfInputRef.current?.click()}
                        onRemove={() => setFileValue('pdfFile', undefined)}
                        onDropFile={(file) => setFileValue('pdfFile', file)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverImage"
              render={() => (
                <FormItem>
                  <FormLabel className="form-label">Cover Image (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange('coverImage')}
                      />
                      <UploadDropzone
                        icon={ImageIcon}
                        text="Click to upload cover image"
                        hint="Leave empty to auto-generate from PDF"
                        file={coverImage}
                        onSelect={() => coverInputRef.current?.click()}
                        onRemove={() => setFileValue('coverImage', undefined)}
                        onDropFile={(file) => setFileValue('coverImage', file)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Title</FormLabel>
                  <FormControl>
                    <input {...field} className="form-input" placeholder="ex: Rich Dad Poor Dad" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Author Name</FormLabel>
                  <FormControl>
                    <input {...field} className="form-input" placeholder="ex: Robert Kiyosaki" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="voice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {voiceGroups.map((group) => (
                        <div key={group.label} className="space-y-2">
                          <p className="text-sm font-medium text-[#5f564c]">{group.label}</p>
                          <div className="voice-selector-options">
                            {group.options.map((voice) => {
                              const isSelected = selectedVoice === voice.value;

                              return (
                                <label
                                  key={voice.value}
                                  className={`voice-selector-option ${
                                    isSelected
                                      ? 'voice-selector-option-selected'
                                      : 'voice-selector-option-default'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={field.name}
                                    value={voice.value}
                                    checked={isSelected}
                                    onChange={() => field.onChange(voice.value)}
                                    className="h-4 w-4 accent-[#663820]"
                                  />
                                  <div className="space-y-1">
                                    <p className="text-base font-semibold text-[#2f2923]">{voice.title}</p>
                                    <p className="text-xs leading-5 text-[#7a7268]">{voice.description}</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <Button type="submit" className="form-btn" disabled={isSubmitting}>
            Begin Synthesis
          </Button>
        </form>
      </Form>
    </>
  );
};

export default UploadForm;
