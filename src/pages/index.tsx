import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import Image from "next/image";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/@/components/ui/form";
import { Input } from "~/@/components/ui/input";
import Login from "~/components/Login";
import Post from "~/components/Post";
import { api } from "~/utils/api";

const Posts = () => {
  const { data } = api.post.getSome.useQuery();

  return (
    <div className="grid w-full space-y-[2px] border-x-2 border-gray-600 bg-gray-600">
      {data?.map((post) => (
        <Post key={post.id} id={post.id} />
      ))}
    </div>
  );
};

const formSchema = z.object({
  content: z.string().min(1).max(255),
});

const MakePost = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });
  const { user } = useUser();
  const trpcContext = api.useContext();
  const mutation = api.post.makePost.useMutation({
    async onSuccess() {
      await trpcContext.post.getSome.invalidate();
    },
  });

  if (!user) return null;

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (values) => {
    mutation.mutate({ content: values.content, userId: user.id });
  };

  return (
    <Form {...form}>
      <div className="sticky top-0 flex w-full items-stretch space-x-5 border-2 border-t-0 border-gray-600 bg-gray-950/50 p-5 backdrop-blur-sm">
        <Image
          src={user.imageUrl}
          alt={`profile image of ${user.username || "someone"}`}
          width={42}
          height={42}
          className="h-fit rounded-full"
        />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col space-y-4"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Mutter something"
                    autoComplete="off"
                    className="w-full border-none"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="ml-auto">
            Mutter
          </Button>
        </form>
      </div>
    </Form>
  );
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="relative mx-auto flex min-h-screen flex-col items-center lg:max-w-2xl">
        <MakePost />
        <Posts />
      </main>

      <Login />
    </>
  );
}
