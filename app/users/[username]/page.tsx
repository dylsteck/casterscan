"use client"
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';

export default function Username() {
    const pathname = usePathname();
    const username = pathname.split('/')[2];

    return (
        <div className="w-[100%] pl-4">
            <h1 className="pt-2 font-medium">@{username}</h1>
        </div>
    )
}