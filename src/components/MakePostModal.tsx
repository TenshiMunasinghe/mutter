import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { type ReactNode } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "~/@/components/ui/form";
import { Textarea } from "~/@/components/ui/textarea";
import { api } from "~/utils/api";

interface Props {
  children: ReactNode;
}

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
    <div className="flex w-full items-stretch space-x-5 p-4">
      <Image
        src={user.imageUrl}
        alt={`profile image of ${user.username || "someone"}`}
        width={42}
        height={42}
        className="h-fit rounded-full"
      />
      <Form {...form}>
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
                  <Textarea
                    placeholder="Mutter something"
                    autoComplete="off"
                    className="w-full resize-none border-none"
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
      </Form>
    </div>
  );
};

const MakePostModal = ({ children }: Props) => {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <MakePost />
      </DialogContent>
    </Dialog>
  );
};

export default MakePostModal;
