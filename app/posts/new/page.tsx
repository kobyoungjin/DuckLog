import { PostForm } from "@/components/post-form";

export default function NewPostPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-headline-md text-headline-md text-primary mb-6">덕질 기록 작성</h1>
      <PostForm mode="create" />
    </div>
  );
}
