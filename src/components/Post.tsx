import { useUser } from "@clerk/nextjs";
import classnames from "classnames";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { type ReactNode } from "react";
import { type IconType } from "react-icons";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegComment, FaRetweet, FaShare } from "react-icons/fa";
import { api } from "~/utils/api";

dayjs.extend(relativeTime);

const Post = ({ id }: { id: string }) => {
  const { user } = useUser();
  const trpcContext = api.useContext();
  const { data: post } = api.post.getById.useQuery({ id });

  const { mutate: remutMutate } = api.post.remut.useMutation({
    async onSuccess() {
      await trpcContext.post.getById.invalidate({ id });
    },
  });

  const { mutate: likeMutate } = api.post.like.useMutation({
    async onSuccess() {
      await trpcContext.post.getById.invalidate({ id });
    },
  });

  if (!post) return null;

  const postedAt = dayjs().to(post.createdAt.toISOString());
  const isLiked =
    post.likes.findIndex((like) => like.userId === user?.id) !== -1;
  const isRemut =
    post.remuts.findIndex((remut) => remut.userId === user?.id) !== -1;

  return (
    <div className="flex space-x-4 bg-gray-950 p-4">
      <Image
        src={post.author.image}
        alt={`profile image of ${post.author.name || "someone"}`}
        width={69}
        height={69}
        className="h-fit rounded-full"
      />
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold">@{post.author.name}</span>
          <span className="text-gray-400">{postedAt}</span>
        </div>
        <div>{post.content}</div>
        <div className="grid grid-cols-4 items-center">
          <PostIcon icon={FaRegComment} className="hover:text-emerald-400">
            <span>{post.comments.length}</span>
          </PostIcon>
          <PostIcon
            icon={FaRetweet}
            className={classnames({
              "hover:text-blue-400": !isRemut,
              "text-blue-400": isRemut,
            })}
            onClick={() =>
              remutMutate({ postId: post.id, userId: post.userId })
            }
          >
            <span>{post.remuts.length}</span>
          </PostIcon>
          <PostIcon
            icon={isLiked ? AiFillHeart : AiOutlineHeart}
            className={classnames({
              "hover:text-red-400": !isLiked,
              "text-red-400": isLiked,
            })}
            onClick={() => likeMutate({ postId: post.id, userId: post.userId })}
          >
            <span>{post.likes.length}</span>
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

export default Post;
