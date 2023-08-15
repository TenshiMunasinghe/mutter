import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { FaSignOutAlt } from "react-icons/fa";
import { Avatar, AvatarImage } from "~/@/components/ui/avatar";
import { Button } from "~/@/components/ui/button";
import MakePostModal from "./MakePostModal";

const Login = () => {
  const { user, isSignedIn } = useUser();

  return (
    <>
      {!isSignedIn ? (
        <footer className="fixed bottom-0 left-0 flex flex-col items-center space-y-3 rounded-tr bg-emerald-700 px-12 py-7">
          <span className="text-2xl font-bold">Join the Muttering.</span>
          <SignInButton mode="modal">
            <Button variant="secondary" className="text-lg">
              Sign In
            </Button>
          </SignInButton>
        </footer>
      ) : (
        user && (
          <footer className="fixed bottom-12 left-12">
            <div className="flex items-center space-x-4 rounded-full p-4 hover:bg-gray-900">
              <Avatar>
                <AvatarImage
                  src={user.imageUrl}
                  alt={user.username || "avatar"}
                />
              </Avatar>
              <div className="flex flex-col">
                <MakePostModal>
                  <div className="text-left">Mutter something,</div>
                </MakePostModal>
                <span className="text-left text-gray-400">
                  @{user.username}
                </span>
              </div>
              <SignOutButton>
                <Button size="icon" className="rounded-full">
                  <FaSignOutAlt className="h-5 w-5" />
                </Button>
              </SignOutButton>
            </div>
          </footer>
        )
      )}
    </>
  );
};

export default Login;
