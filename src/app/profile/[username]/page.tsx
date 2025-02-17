import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from '@/actions/profile.action';
import ProfilePageClient from '@/components/ProfilePageClient';
import { notFound } from 'next/navigation';
import React from 'react';

interface PageProps {
  params: Promise<{ username: string }>,
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const user = await getProfileByUsername(username);

  if (!user) {
    return;
  }

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

async function ProfilePageServer({ params }: PageProps) {
  const { username } = await params;
  const user = await getProfileByUsername(username);

  if (!user) {
    notFound();
  }

  const [likedPosts, posts, isCurrentUserFollowing] = await Promise.all([
    getUserLikedPosts(user.id),
    getUserPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
  );
}

export default ProfilePageServer;
