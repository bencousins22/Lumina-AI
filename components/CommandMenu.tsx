
import * as React from "react"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  MessageSquare,
  Activity,
  Folder,
  Database,
  CalendarClock,
  LogOut,
  Monitor,
  FolderGit2
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./ui/command"

interface CommandMenuProps {
  onNavigate: (view: string) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export function CommandMenu({ onNavigate, onOpenSettings, onLogout }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => onNavigate('chat'))}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Chat</span>
            <CommandShortcut>⌘1</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate('projects'))}>
            <FolderGit2 className="mr-2 h-4 w-4" />
            <span>Projects</span>
            <CommandShortcut>⌘2</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate('dashboard'))}>
            <Activity className="mr-2 h-4 w-4" />
            <span>Node Editor</span>
            <CommandShortcut>⌘3</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate('scheduler'))}>
            <CalendarClock className="mr-2 h-4 w-4" />
            <span>Scheduler</span>
            <CommandShortcut>⌘4</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate('files'))}>
            <Folder className="mr-2 h-4 w-4" />
            <span>Files</span>
            <CommandShortcut>⌘5</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate('backups'))}>
            <Database className="mr-2 h-4 w-4" />
            <span>Backups</span>
            <CommandShortcut>⌘6</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="System">
          <CommandItem onSelect={() => runCommand(onOpenSettings)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
           <CommandItem onSelect={() => runCommand(onLogout)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
