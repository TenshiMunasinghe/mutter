import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarImage } from "~/@/components/ui/avatar";
import { Button } from "~/@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "~/@/components/ui/form";
import { Textarea } from "~/@/components/ui/textarea";
import { api } from "~/utils/api";

interface Props {
  children: ReactNode;
}

export const useMakePost = () => {
  const formSchema = z.object({
    content: z.string().min(1).max(255),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });
  const { user } = useUser();
  const trpcContext = api.useContext();
  const { mutateAsync, isLoading } = api.post.makePost.useMutation({
    async onSuccess() {
      await trpcContext.post.getSome.invalidate();
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (
    values
  ) => {
    if (!user || isLoading) return;
    try {
      await mutateAsync({ content: values.content, userId: user.id });
      form.setValue("content", "");
    } catch (e) {
      console.error(e);
    }
  };

  return { form, onSubmit, user, isLoading };
};

const MakePost = () => {
  const { form, onSubmit, user, isLoading } = useMakePost();

  if (!user) return null;

  return (
    <div className="flex w-full items-stretch space-x-5 p-4">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={user.imageUrl}
          alt={`profile image of ${user.username || "someone"}`}
        />
      </Avatar>
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
          <Button type="submit" className="ml-auto" disabled={isLoading}>
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
