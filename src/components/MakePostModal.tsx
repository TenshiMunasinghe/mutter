import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/@/components/ui/dialog";

import { useUser } from "@clerk/nextjs";

import { useState, type ReactNode } from "react";
import { api } from "~/utils/api";

interface Props {
  children: ReactNode;
}

const MakePostModal = ({ children }: Props) => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const trpcContext = api.useContext();
  const mutation = api.post.makePost.useMutation({
    async onSuccess() {
      setInput("");
      await trpcContext.post.getSome.invalidate();
    },
  });

  if (!user) return null;

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure absolutely sure?</DialogTitle>
          {/* <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate({ content: input, userId: user.id });
            }}
            className="sticky top-0 flex w-full items-stretch space-x-5 border-2 border-t-0 border-gray-600 bg-gray-950/50 p-5 backdrop-blur-sm"
          >
            <Image
              src={user.imageUrl}
              alt={`profile image of ${user.username || "someone"}`}
              width={42}
              height={42}
              className="h-fit rounded-full"
            />
            <input
              type="text"
              className="w-full bg-transparent"
              placeholder="Mutter something."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </form> */}
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default MakePostModal;
