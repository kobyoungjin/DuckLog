import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/post-form";
import type { PostCategory } from "@/lib/category";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-headline-md text-headline-md text-primary mb-6">기록 수정</h1>
      <PostForm
        mode="edit"
        postId={post.id}
        initialData={{
          category: post.category as PostCategory,
          title: post.title,
          content: post.content,
          date: post.date.toISOString().slice(0, 10),
          images: post.images,
        }}
      />
    </div>
  );
}
