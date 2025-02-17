'use client';

import { deletePost, getPosts, toggleLike } from '@/actions/post.action';
import { SignInButton, useUser } from '@clerk/nextjs';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import DeleteAlertDialog from './DeleteAlertDialog';
import { Button } from './ui/button';
import { HeartIcon, MessageCircleIcon } from 'lucide-react';
import CommentsSection from './CommentsSection';

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

function PostCard({ dbUserId, post }: { post: Post; dbUserId: string | null }) {
  const { user } = useUser();
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLike, setHasLike] = useState(
    post.likes.some((like) => like.userId === dbUserId)
  );
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (isLiking) {
      return;
    }

    try {
      setIsLiking(true);
      setHasLike((prev) => !prev);
      setOptimisticLikes((prev) => prev + (hasLike ? -1 : 1));
      await toggleLike(post.id);
    } catch (error) {
      setHasLike(post.likes.some((like) => like.userId === dbUserId));
      setOptimisticLikes(post._count.likes);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeletePost = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);

      if (result?.success) {
        toast.success('Post deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-4 sm:p-6'>
        <div className='space-y-4'>
          <div className='flex space-x-3 sm:space-x-4'>
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className='size-8 sm:w-10 sm:h-10'>
                <AvatarImage
                  src={post.author.image || '/avatar.png'}
                  alt='Avatar image'
                />
              </Avatar>
            </Link>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate'>
                  <Link
                    href={`/profile/${post.author.username}`}
                    className='truncate font-semibold'
                  >
                    {post.author.name}
                  </Link>
                  <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                    <Link href={`/profile/${post.author.username}`}>
                      @{post.author.username}
                    </Link>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt))} ago
                    </span>
                  </div>
                </div>

                {dbUserId === post.author.id && (
                  <DeleteAlertDialog
                    isDeleting={isDeleting}
                    onDelete={handleDeletePost}
                  />
                )}
              </div>

              <p className='mt-2 text-sm text-foreground break-words'>
                {post.content}
              </p>
            </div>
          </div>

          {post.image && (
            <div className='rounded-lg overflow-hidden'>
              <img
                src={post.image}
                alt='Post content'
                className='w-full h-auto object-cover'
              />
            </div>
          )}

          <div className='flex items-center pt-2 space-x-2'>
            {user ? (
              <Button
                variant='ghost'
                size='sm'
                className={`text-muted-foreground gap-2 ${
                  hasLike
                    ? 'text-red-500 hover:text-red-600'
                    : 'hover:text-red-500'
                }`}
                onClick={handleLike}
              >
                <HeartIcon
                  className={`size-5 ${hasLike ? 'fill-current' : ''}`}
                />
                <span>{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode='modal'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground gap-2'
                >
                  <HeartIcon className='size-5' />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant='ghost'
              size='sm'
              className='text-muted-foreground gap-2 hover:text-blue-500'
              onClick={() => setShowComments((prev) => !prev)}
            >
              <MessageCircleIcon
                className={`size-5 ${
                  showComments ? 'fill-blue-500 text-blue-500' : ''
                }`}
              />
              <span>{post._count.comments}</span>
            </Button>
          </div>

          {showComments && (
            <CommentsSection comments={post.comments} postId={post.id} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PostCard;
