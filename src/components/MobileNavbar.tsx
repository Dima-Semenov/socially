'use client';

import React, { useState } from 'react';
import { SignInButton, SignOutButton, useAuth } from '@clerk/nextjs';
import {
  BellIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  UserIcon,
} from 'lucide-react';
import ModeToggle from './ModeToggle';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function MobileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <div className='flex md:hidden items-center space-x-2'>
      <ModeToggle isMobile />

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant='ghost' size='icon'>
            <MenuIcon className='w-5 h-5' />
          </Button>
        </SheetTrigger>

        <SheetContent side='right' className='w-[300px]'>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <nav className='flex flex-col space-y-4 mt-6'>
            <Button
              variant='ghost'
              className='flex items-center gap-3 justify-start'
              asChild
            >
              <Link href='/'>
                <HomeIcon className='w-4 h-4' />
                Home
              </Link>
            </Button>

            {isSignedIn ? (
              <>
                <Button
                  variant='ghost'
                  className='flex items-center gap-3 justify-start'
                  asChild
                >
                  <Link href='/notifications'>
                    <BellIcon className='w-4 h-4' />
                    Notifications
                  </Link>
                </Button>
                <Button
                  variant='ghost'
                  className='flex items-center gap-3 justify-start'
                  asChild
                >
                  <Link href='/profile'>
                    <UserIcon className='w-4 h-4' />
                    Profile
                  </Link>
                </Button>
                <SignOutButton>
                  <Button
                    variant='ghost'
                    className='flex items-center gap-3 justify-start w-full'
                  >
                    <LogOutIcon className='w-4 h-4' />
                    Logout
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <SignInButton mode='modal'>
                <Button variant='default' className='w-full'>
                  Sign in
                </Button>
              </SignInButton>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavbar;
