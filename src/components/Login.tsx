import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { FaSignOutAlt } from "react-icons/fa";
import MakePostModal from "./MakePostModal";

const Login = () => {
  const { user, isSignedIn } = useUser();

  return (
    <>
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
            <div className="flex items-center space-x-4 rounded-full p-4 hover:bg-gray-900">
              <Image
                src={user.imageUrl}
                alt="profile pic"
                width={42}
                height={42}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <MakePostModal>
                  <div className="text-left">Mutter something,</div>
                </MakePostModal>
                <span className="text-left text-gray-400">
                  @{user.username}
                </span>
              </div>
              <SignOutButton>
                <button className="h-[42px] w-[42px] rounded-full bg-emerald-700 p-2">
                  <FaSignOutAlt className="h-full w-full" />
                </button>
              </SignOutButton>
            </div>
          </footer>
        )
      )}
    </>
  );
};

export default Login;
