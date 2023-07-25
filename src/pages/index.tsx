import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import classnames from "classnames";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Head from "next/head";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { AiOutlineHeart } from "react-icons/ai";
import { FaRegComment, FaRetweet, FaShare, FaSignOutAlt } from "react-icons/fa";
import { api, type RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

const Posts = () => {
  const { data } = api.post.getSome.useQuery();

  return (
    <div className="grid w-full space-y-[2px] border-x-2 border-gray-600 bg-gray-600">
      {data?.map((post) => (
        <Post key={post.id} {...post} />
      ))}
    </div>
  );
};

const Post = (props: RouterOutputs["post"]["getSome"][number]) => {
  const trpcContext = api.useContext();

  const { mutate: remutMutate } = api.post.remut.useMutation({
    async onSuccess() {
      await trpcContext.post.getSome.invalidate();
    },
  });

  const postedAt = dayjs().to(props.createdAt.toISOString());

  return (
    <div className="flex space-x-4 bg-gray-950 p-4">
      <Image
        src={props.author.image}
        alt={`profile image of ${props.author.name || "someone"}`}
        width={69}
        height={69}
        className="h-fit rounded-full"
      />
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold">@{props.author.name}</span>
          <span className="text-gray-400">{postedAt}</span>
        </div>
        <div>{props.content}</div>
        <div className="grid grid-cols-4 items-center">
          <PostIcon icon={FaRegComment} className="hover:text-emerald-400">
            <span>{props.comments.length}</span>
          </PostIcon>
          <PostIcon
            icon={FaRetweet}
            className="hover:text-blue-400"
            onClick={() =>
              remutMutate({ postId: props.id, userId: props.userId })
            }
          >
            <span>{props.remuts.length}</span>
          </PostIcon>
          <PostIcon icon={AiOutlineHeart} className="hover:text-red-400">
            <span>{props.likes.length}</span>
          </PostIcon>
          <PostIcon icon={FaShare} className="hover:text-emerald-400" />
        </div>
      </div>
    </div>
  );
};

const PostIcon = ({
  icon: Icon,
  ...props
}: {
  icon: IconType;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <button
      className={classnames(
        "flex items-center space-x-2 transition-colors",
        props.className
      )}
      onClick={props.onClick}
    >
      <Icon className="h-4 w-4" />
      {props.children}
    </button>
  );
};

const Form = (props: {
  user: { name: string; imageUrl: string; id: string };
}) => {
  const [input, setInput] = useState("");
  const trpcContext = api.useContext();
  const mutation = api.post.makePost.useMutation({
    async onSuccess() {
      setInput("");
      await trpcContext.post.getSome.invalidate();
    },
  });
  const { user } = useUser();

  if (!user?.id) return null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate({ content: input, userId: user.id });
      }}
      className="sticky top-0 flex w-full items-stretch space-x-5 border-2 border-t-0 border-gray-600 bg-gray-950/50 p-5 backdrop-blur-sm"
    >
      <Image
        src={props.user.imageUrl}
        alt={`profile image of ${props.user.name || "someone"}`}
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
    </form>
  );
};

export default function Home() {
  const { user, isSignedIn } = useUser();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative mx-auto flex min-h-screen flex-col items-center lg:max-w-2xl">
        {user && (
          <Form
            user={{
              name: user.username || "",
              imageUrl: user.imageUrl,
              id: user.id,
            }}
          />
        )}
        <Posts />
      </main>

      {!isSignedIn ? (
        <footer className="fixed bottom-0 left-0 flex flex-col items-center space-y-3 rounded-tr bg-emerald-700 px-12 py-7">
          <span className="text-2xl font-bold">Join the Muttering.</span>
          <SignInButton mode="modal">
            <button className="w-fit rounded bg-gray-100 px-5 py-2 text-lg text-emerald-700 ">
              Sign In
            </button>
          </SignInButton>
        </footer>
      ) : (
        user && (
          <footer className="fixed bottom-12 left-12">
            <button className="flex items-center space-x-4 rounded-full p-4 hover:bg-gray-900">
              <Image
                src={user.imageUrl}
                alt="profile pic"
                width={42}
                height={42}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <span className="w-full text-left">Mutter something,</span>
                <span className="text-left text-gray-400">
                  @{user.username}
                </span>
              </div>
              <SignOutButton>
                <button className="h-[42px] w-[42px] rounded-full bg-emerald-700 p-2">
                  <FaSignOutAlt className="h-full w-full" />
                </button>
              </SignOutButton>
            </button>
          </footer>
        )
      )}
    </>
  );
}
