import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { getBookBySlug } from '@/lib/actions/book.actions';

interface Props {
    params: Promise<{ slug: string }>;
}

const Page = async ({ params }: Props) => {
    const { slug } = await params;  // await params first

    const { userId, redirectToSignIn } = await auth();

    if (!userId) {
        return redirectToSignIn({ returnBackUrl: `/book/${slug}` });
    }

    const book = await getBookBySlug(slug);

    if (!book.success || !book.data) {
        return notFound();
    }

    return (
        <main>
            <h1>{book.data.title}</h1>
            <p>{book.data.author}</p>
        </main>
    );
};

export default Page;