'use client';

import {
  getProfileByUsername,
  getUserPosts,
  updateUserProfile,
} from '@/actions/profile.action';
import { toggleFollow } from '@/actions/user.action';
import { SignInButton, useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import {
  CalendarIcon,
  EditIcon,
  FileTextIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import PostCard from './PostCard';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
}

function ProfilePageClient({
  user,
  posts,
  likedPosts,
  isFollowing: initialIsFollowing,
}: ProfilePageClientProps) {
  const { user: currentUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user.name || '',
    location: user.location || '',
    website: user.website || '',
    bio: user.bio || '',
  });

  const handleEditSubmit = async () => {
    const formData = new FormData();

    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await updateUserProfile(formData);

    if (result.success) {
      setShowEditDialog(false);
      toast.success('Profile updated successfully');
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      setIsFollowing((prev) => !prev);
    } catch (error) {
      toast.error('Failed to follow');
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const isOwnProfile =
    user.username === currentUser?.username ||
    currentUser?.emailAddresses[0].emailAddress.split('@')[0] === user.username;

  const formattedDate = format(new Date(user.createdAt), 'MMMM yyyy');

  return (
    <div className='max-w-3xl mx-auto'>
      <div className='grid grid-cols-1 gap-6'>
        <div className='w-full max-w-lg mx-auto'>
          <Card className='bg-card'>
            <CardContent className='pt-6'>
              <div className='flex flex-col items-center text-center'>
                <Avatar className='w-24 h-24'>
                  <AvatarImage
                    src={user.image || '/avatar.png'}
                    alt='Avatar image'
                  />
                </Avatar>
                <h1 className='mt-4 text-2xl font-bold'>
                  {user.name ?? user.username}
                </h1>
                <p className='text-muted-foreground'>@{user.username}</p>
                <p className='mt-2 text-sm'>{user.bio}</p>

                <div className='w-full mt-6'>
                  <div className='flex justify-between mb-4'>
                    <div>
                      <div className='font-semibold'>
                        {user._count.following}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Following
                      </div>
                    </div>
                    <Separator orientation='vertical' />
                    <div>
                      <div className='font-semibold'>
                        {user._count.followers}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Followers
                      </div>
                    </div>
                    <Separator orientation='vertical' />
                    <div>
                      <div className='font-semibold'>{user._count.posts}</div>
                      <div className='text-sm text-muted-foreground'>Posts</div>
                    </div>
                  </div>
                </div>

                {!currentUser ? (
                  <SignInButton mode='modal'>
                    <Button className='w-full mt-4'>Follow</Button>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <Button
                    className='w-full mt-4'
                    onClick={() => setShowEditDialog(true)}
                  >
                    <EditIcon className='size-4 mr-2' />
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    className='w-full mt-4'
                    onClick={handleFollow}
                    disabled={isUpdatingFollow}
                    variant={isFollowing ? 'outline' : 'default'}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}

                <div className='w-full mt-6 space-y-2 text-sm'>
                  {user.location && (
                    <div className='flex items-center text-muted-foreground'>
                      <MapPinIcon className='size-4 mr-2' />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className='flex items-center text-muted-foreground'>
                      <LinkIcon className='size-4 mr-2' />
                      <a
                        href={
                          user.website.startsWith('http')
                            ? user.website
                            : `https://${user.website}`
                        }
                        className='hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className='flex items-center text-muted-foreground'>
                    <CalendarIcon className='size-4 mr-2' />
                    Joined {formattedDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs className='w-full' defaultValue='posts'>
          <TabsList className='w-full justify-start border-b rounded-none h-auto p-0 bg-transparent'>
            <TabsTrigger
              value='posts'
              className='flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 font-semibold'
            >
              <FileTextIcon className='size-4' />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value='likes'
              className='flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 font-semibold'
            >
              <HeartIcon className='size-4' />
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value='posts' className='mt-6'>
            <div className='space-y-6'>
              {posts.length ? (
                posts.map((post) => (
                  <PostCard
                    post={post}
                    dbUserId={user.id}
                    key={user.id + Math.random().toString()}
                  />
                ))
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  No posts yet
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value='likes' className='mt-6'>
            <div className='space-y-6'>
              {likedPosts.length ? (
                likedPosts.map((post) => (
                  <PostCard
                    post={post}
                    key={user.id + Math.random().toString()}
                    dbUserId={user.id}
                  />
                ))
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  No liked posts yet
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label>Name</Label>
                <Input
                  value={editForm.name}
                  name='name'
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder='Your name'
                />
              </div>

              <div className='space-y-2'>
                <Label>Bio</Label>
                <Textarea
                  value={editForm.bio}
                  name='bio'
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  className='min-h-[100px]'
                  placeholder='Tell us about yourself'
                />
              </div>

              <div className='space-y-2'>
                <Label>Location</Label>
                <Input
                  value={editForm.location}
                  name='location'
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder='Where are you based?'
                />
              </div>

              <div className='space-y-2'>
                <Label>Website</Label>
                <Input
                  value={editForm.website}
                  name='website'
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder='Your personal website'
                />
              </div>
            </div>

            <div className='flex justify-end gap-3'>
              <DialogClose asChild>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default ProfilePageClient;
