import { auth } from '@clerk/nextjs/server';
import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'Missing BLOB_READ_WRITE_TOKEN in environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();

    const jsonResponse = await handleUpload({
      token,
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['application/pdf', 'image/*'],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: 'Failed to generate upload token.' }, { status: 500 });
  }
}
