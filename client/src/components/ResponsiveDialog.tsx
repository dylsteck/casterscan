import * as React from "react"

import { cn } from "@/lib/utils"
import { useIsDesktop } from "@/hooks/use-is-desktop"
import { getLocalStorage, setLocalStorage } from "@/lib/localStorage"
import { DEFAULT_SNAPCHAIN_NODE } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SettingsDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure your preferences.
            </DialogDescription>
          </DialogHeader>
          <SettingsForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>
            Configure your preferences.
          </DrawerDescription>
        </DrawerHeader>
        <SettingsForm className="px-4" onClose={() => setOpen(false)} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function SettingsForm({ className, onClose }: React.ComponentProps<"form"> & { onClose?: () => void }) {
  const [nodeUrl, setNodeUrl] = React.useState(() => 
    getLocalStorage('snapchain-node') || DEFAULT_SNAPCHAIN_NODE
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = new URL(nodeUrl)
      const normalizedUrl = `${url.protocol}//${url.hostname}:3381`
      
      setLocalStorage('snapchain-node', normalizedUrl)
      window.dispatchEvent(new CustomEvent('snapchain-node-changed', { detail: normalizedUrl }))
      setNodeUrl(normalizedUrl)
      onClose?.()
    } catch {
      return
    }
  }

  return (
    <form className={cn("grid items-start gap-4", className)} onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="node">Snapchain Node</Label>
        <Input 
          id="node" 
          placeholder="url"
          value={nodeUrl}
          onChange={(e) => setNodeUrl(e.target.value)}
        />
      </div>
      <Button className="cursor-pointer" type="submit">Save</Button>
    </form>
  )
}
