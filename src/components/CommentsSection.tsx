'use client';

import React, { useState } from 'react';
import { Avatar, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@clerk/nextjs';
import { Textarea } from './ui/textarea';
import toast from 'react-hot-toast';
import { createComment } from '@/actions/post.action';
import { Button } from './ui/button';
import { SendIcon } from 'lucide-react';

type Comment = {
  id: string;
  author: {
    image: string | null;
    id: string;
    name: string | null;
    username: string;
  };
  createdAt: Date;
  content: string;
};

interface CommentsSectionProps {
  comments: Comment[];
  postId: string;
}

function CommentsSection({ comments, postId }: CommentsSectionProps) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;

    try {
      setIsCommenting(true);
      const result = await createComment(postId, newComment);

      if (result?.success) {
        setNewComment('');
        toast.success('Comment posted successfully');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <>
      <div className='space-y-4 pt-4 border-t'>
        <div className='space-y-4'>
          {comments.map((comment) => (
            <div key={comment.id} className='flex space-x-3'>
              <Avatar className='size-8 flex-shrink-0'>
                <AvatarImage
                  src={comment.author.image ?? '/avatar.png'}
                  alt='Avatar image'
                />
              </Avatar>

              <div className='flex-1 min-w-0'>
                <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                  <span className='font-medium text-sm'>
                    {comment.author.name}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    @{comment.author.username}
                  </span>
                  <span className='text-sm text-muted-foreground'>•</span>
                  <span className='text-sm text-muted-foreground'>
                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                  </span>
                </div>
                <p className='text-sm break-words'>{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {user ? (
        <div className='flex space-x-3'>
          <Avatar className='size-8 flex-shrink-0'>
            <AvatarImage
              src={user.imageUrl ?? '/avatar.png'}
              alt='Avatar image'
            />
          </Avatar>
          <div className='flex-1'>
            <Textarea
              placeholder='Write a comment...'
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className='min-w-[80px] resize-none'
            />
            <div className='flex justify-end mt-2'>
              <Button
                size='sm'
                onClick={handleAddComment}
                disabled={!newComment.trim() || isCommenting}
                className='flex items-center gap-2'
              >
                {isCommenting ? (
                  'Posting...'
                ) : (
                  <>
                    <SendIcon className='size-4' />
                    Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p></p>
      )}
    </>
  );
}

export default CommentsSection;
