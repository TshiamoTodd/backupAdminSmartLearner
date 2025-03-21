'use client'
import { cn } from '@/lib/utils'
import { Book, File, HomeIcon, Play, User2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export const dashboardLinks = [
    {
        id: 0,
        name: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon
    },
    {
        id: 1,
        name: 'Users',
        href: '/dashboard/users',
        icon: User2
    },
    {
        id: 2,
        name: 'Subjects',
        href: '/dashboard/subjects',
        icon: Book
    },
    {
        id: 3,
        name: 'Videos',
        href: '/dashboard/videos',
        icon: Play
    },
    {
        id: 4,
        name: 'Quesntion Papers',
        href: '/dashboard/papers',
        icon: File
    },
]

const DashboardLinks = () => {
    const pathname = usePathname()
  return (
    <>
        {dashboardLinks.map((link) => (
            <Link href={link.href} key={link.id} className={cn(
                pathname === link.href ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground',
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:text-primary"
            )}>
                <link.icon className='size-4' />
                {link.name}
            </Link>
        ))}
    </>
  )
}

export default DashboardLinks