"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Store, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/infra/auth/client";

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export function StoreUserMenu({
  userName,
  isStaff,
  hasDealer,
}: {
  userName: string;
  isStaff: boolean;
  hasDealer: boolean;
}) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-10 rounded-full">
          <Avatar className="size-8">
            <AvatarFallback className="bg-brand-50 text-[12px] font-semibold text-brand-700">
              {initials(userName) || <User className="size-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <p className="text-body-sm leading-body-sm font-medium text-neutral-900">{userName}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isStaff ? (
          <DropdownMenuItem asChild>
            <Link href="/panel">
              <LayoutDashboard />
              Yönetim Paneli
            </Link>
          </DropdownMenuItem>
        ) : null}
        {hasDealer ? (
          <DropdownMenuItem asChild>
            <Link href="/bayi">
              <Store />
              Bayi Panelim
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={handleSignOut} variant="destructive">
          <LogOut />
          Çıkış Yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
