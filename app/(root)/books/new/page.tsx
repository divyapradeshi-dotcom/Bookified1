import { auth } from '@clerk/nextjs/server';
import UploadForm from '@/components/UploadForm';

const Page = async () => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: '/books/new' });
  }

  return (
    <main className="new-book">
      <div className="new-book-wrapper">
        <section className="space-y-3">
          <h1 className="page-title-xl">Add a New Book</h1>
          <p className="subtitle">Upload a PDF to generate your interactive interview.</p>
        </section>

        <UploadForm />
      </div>
    </main>
  );
};

export default Page;
