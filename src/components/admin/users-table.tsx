"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateUserPriceListAction } from "@/app/(admin)/admin/kullanicilar/actions";

type UserRow = {
  id: string;
  name: string;
  email: string;
  accountType: "STAFF" | "DEALER";
  priceListId: string | null;
};

export function UsersTable({
  users,
  priceLists,
}: {
  users: UserRow[];
  priceLists: { id: string; name: string }[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLocaleLowerCase("tr-TR").includes(q) ||
        u.email.toLocaleLowerCase("tr-TR").includes(q),
    );
  }, [users, query]);

  return (
    <div>
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Kullanıcı ara (isim, e-posta)..."
          className="h-10 border-border bg-muted pl-9 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kullanıcı</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead className="w-56">Fiyat Listesi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-neutral-400">
                  Sonuç bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-neutral-900">{user.name}</TableCell>
                  <TableCell className="text-neutral-500">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.accountType === "STAFF" ? "default" : "secondary"}>
                      {user.accountType === "STAFF" ? "Yetiş" : "Bayi"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.accountType === "STAFF" ? (
                      <span className="text-caption text-neutral-400">—</span>
                    ) : (
                      <Select
                        defaultValue={user.priceListId ?? "none"}
                        onValueChange={(value) => updateUserPriceListAction(user.id, value)}
                      >
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Atanmamış (baz fiyat)</SelectItem>
                          {priceLists.map((list) => (
                            <SelectItem key={list.id} value={list.id}>
                              {list.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
