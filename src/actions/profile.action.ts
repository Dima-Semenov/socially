'use server';

import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { getDbUserId } from './user.action';

export async function getProfileByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        username: true,
        name: true,
        website: true,
        image: true,
        id: true,
        email: true,
        location: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            likes: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error('Failed to get user profile: ', error);
    throw new Error('Failed to get user profile');
  }
}

export async function getUserPosts(userId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts;
  } catch (error) {
    console.error('Failed to get user posts: ', error);
    throw new Error('Failed to get user posts');
  }
}

export async function getUserLikedPosts(userId: string) {
  try {
    const likedPosts = await prisma.post.findMany({
      where: {
        likes: {
          some: {
            userId,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return likedPosts;
  } catch (error) {
    console.error('Failed fetching liked posts: ', error);
    throw new Error('Failed fetching liked posts');
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      throw new Error('Unauthorized');
    }

    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const website = formData.get('website') as string;
    const location = formData.get('location') as string;

    const user = await prisma.user.update({
      where: {
        clerkId,
      },
      data: {
        name,
        bio,
        website,
        location,
      },
    });

    revalidatePath('/profile');
    return { success: true, user };
  } catch (error) {
    console.error('Error updating profile', error);
    return { success: false };
  }
}

export async function isFollowing(userId: string) {
  try {
    const currentUserId = await getDbUserId();

    if (!currentUserId) {
      return false;
    }

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    return Boolean(follow);
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}
