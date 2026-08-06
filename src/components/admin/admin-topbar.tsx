"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, LogOut, Mail, Search, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { authClient } from "@/infra/auth/client";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AdminTopbar({
  userName,
  userEmail,
  section = "Pano",
}: {
  userName: string;
  userEmail: string;
  section?: string;
}) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4">
      <SidebarTrigger className="text-muted-foreground hover:bg-muted hover:text-foreground" />
      <Separator orientation="vertical" className="h-5" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground">{section}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button
        variant="outline"
        size="sm"
        className="ml-auto h-9 w-56 justify-start gap-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
      >
        <Search className="size-3.5" aria-hidden />
        Ara...
        <kbd className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 text-caption leading-caption text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      <Link
        href="/admin/whatsapp"
        className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Mesajlar"
      >
        <Mail className="size-4" aria-hidden />
      </Link>
      <button
        type="button"
        className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Bildirimler"
      >
        <Bell className="size-4" aria-hidden />
      </button>

      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-muted"
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-brand-600 text-white">
                {initials(userName) || <User className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-left sm:block">
              <span className="block text-body-sm leading-body-sm font-semibold text-foreground">
                {userName}
              </span>
              <span className="block text-caption text-muted-foreground">{userEmail}</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal">
            <p className="text-body-sm leading-body-sm font-medium text-neutral-900">
              {userName}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} variant="destructive">
            <LogOut />
            Çıkış Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
