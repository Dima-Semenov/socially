import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HomeIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

function NotFound() {
  return (
    <div className='min-h-[80vh] grid place-items-center px-4'>
      <Card className='w-full max-w-md'>
        <CardContent className='pt-6'>
          <div className='text-center space-y-6'>
            <p className='text-8xl font-bold text-primary font-mono'>404</p>

            <div className='space-y-2'>
              <h1 className='text-2xl font-bold tracking-tighter'>
                User not found
              </h1>
              <p className='text-muted-foreground'>
                The user you're looking for doesn't exist.
              </p>
            </div>

            <div className='flex justify-center w-full'>
              <Button variant='default' asChild>
                <Link href='/'>
                  <HomeIcon className='size-4 mr-2' />
                  Back to home page
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotFound;
