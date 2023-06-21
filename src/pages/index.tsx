import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import Image from "next/image";
import { FaSignOutAlt } from "react-icons/fa";
import { RouterOutputs, api } from "~/utils/api";

const Posts = () => {
  const { data } = api.post.getSome.useQuery();

  return (
    <div>
      {data?.map((post) => (
        <Post key={post.id} {...post} />
      ))}
    </div>
  );
};

const Post = (props: RouterOutputs["post"]["getSome"][number]) => {
  return (
    <div className="flex space-x-4 p-4">
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
          <span className="text-gray-400">69 secs ago</span>
        </div>
        <div>{props.content}</div>
      </div>
    </div>
  );
};

export default function Home() {
  const { user, isSignedIn } = useUser();

  console.log(user?.id);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
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
