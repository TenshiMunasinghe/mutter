import classnames from "classnames";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ComponentProps } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegComment, FaRetweet, FaShare } from "react-icons/fa";
import { Avatar, AvatarImage } from "~/@/components/ui/avatar";
import { PostIcon, usePost } from "~/pages/post/[id]";

dayjs.extend(relativeTime);

const LinkWithoutPropagation = ({
  onClick,
  ...props
}: ComponentProps<typeof Link>) => {
  return (
    <Link
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
    />
  );
};

const Post = ({ id }: { id: string }) => {
  const router = useRouter();

  const { post, isLiked, isRemut, handleLike, handleRemut } = usePost(id);

  if (!post) return null;

  const postedAt = dayjs().to(post?.createdAt.toISOString());

  return (
    <div
      className="flex cursor-pointer flex-col space-y-3 bg-gray-950 p-4"
      onClick={() => router.push(`/post/${id}`)}
    >
      <div className="flex w-full space-x-5">
        <LinkWithoutPropagation href={`/user/${post.userId}`} className="h-fit">
          <Avatar className="h-14 w-14">
            <AvatarImage
              src={post.author.image || ""}
              alt={`profile image of ${post.author.name || "someone"}`}
            />
          </Avatar>
        </LinkWithoutPropagation>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <LinkWithoutPropagation
              href={`/user/${post.userId}`}
              className="text-lg font-semibold"
            >
              @{post.author.name}
            </LinkWithoutPropagation>
            <span className="text-gray-400">{postedAt}</span>
          </div>
          <div>{post.content}</div>
        </div>
      </div>
      <div className="flex items-center justify-evenly">
        <PostIcon icon={FaRegComment} className="hover:text-emerald-400">
          <span>{post.comments.length}</span>
        </PostIcon>
        <PostIcon
          icon={FaRetweet}
          className={classnames({
            "hover:text-blue-400": !isRemut,
            "text-blue-400": isRemut,
          })}
          onClick={handleRemut}
        >
          <span>{post.remuts.length}</span>
        </PostIcon>
        <PostIcon
          icon={isLiked ? AiFillHeart : AiOutlineHeart}
          className={classnames({
            "hover:text-red-400": !isLiked,
            "text-red-400": isLiked,
          })}
          onClick={handleLike}
        >
          <span>{post.likes.length}</span>
        </PostIcon>
        <PostIcon icon={FaShare} className="hover:text-emerald-400" />
      </div>
    </div>
  );
};

export default Post;
