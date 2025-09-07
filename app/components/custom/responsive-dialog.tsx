'use client';

import * as React from 'react';
import { useMediaQuery } from '@/app/hooks/use-media-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/app/components/ui/drawer';

interface ResponsiveDialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  maxWidth?: string;
}

export function ResponsiveDialog({
  children,
  isOpen,
  setIsOpen,
  title,
  description,
  maxWidth = "max-w-4xl",
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={`border border-black bg-white !rounded-none shadow-none ${maxWidth} max-h-[90vh] overflow-hidden`}>
          <DialogHeader className="pb-2">
            {title && <DialogTitle className="text-lg font-bold">{title}</DialogTitle>}
            {description && <DialogDescription className="text-sm text-gray-600 mt-1">{description}</DialogDescription>}
          </DialogHeader>
          <div className="pt-2 overflow-auto flex-1">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="border border-black bg-white !rounded-none max-h-[90vh]">
        <DrawerHeader className="text-left pb-4">
          {title && <DrawerTitle className="text-lg font-bold">{title}</DrawerTitle>}
          {description && <DrawerDescription className="text-sm text-gray-600 mt-1">{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="px-6 pt-2 pb-6 overflow-auto flex-1">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
