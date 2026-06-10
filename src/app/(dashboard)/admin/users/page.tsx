"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Mail, User, Shield } from "lucide-react";
import { getRoleColor } from "@/lib/utils";

const users = [
  { id: 1, name: "Alex Admin", email: "admin@fixflow.com", role: "admin", status: "active", department: "Management" },
  { id: 2, name: "Maria Manager", email: "manager@fixflow.com", role: "manager", status: "active", department: "Operations" },
  { id: 3, name: "Sam Supervisor", email: "supervisor@fixflow.com", role: "supervisor", status: "active", department: "Field Operations" },
  { id: 4, name: "Sarah Staff", email: "staff@fixflow.com", role: "staff", status: "active", department: "Maintenance" },
  { id: 5, name: "Mike Chen", email: "mike@fixflow.com", role: "staff", status: "active", department: "HVAC" },
  { id: 6, name: "Emma Wilson", email: "emma@fixflow.com", role: "staff", status: "active", department: "Electrical" },
  { id: 7, name: "John Doe", email: "john@fixflow.com", role: "staff", status: "inactive", department: "Plumbing" },
  { id: 8, name: "Will Stakeholder", email: "stakeholder@fixflow.com", role: "stakeholder", status: "active", department: "External" },
  { id: 9, name: "Tom Tenant", email: "tenant@fixflow.com", role: "tenant", status: "active", department: "External" },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Create and manage all platform users
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10" placeholder="Full name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10" type="email" placeholder="Email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="stakeholder">Stakeholder</SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input placeholder="Department" />
              </div>
              <Button type="submit" className="w-full">
                Create User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-10 max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left pb-3 font-medium">Name</th>
                  <th className="text-left pb-3 font-medium">Email</th>
                  <th className="text-left pb-3 font-medium">Role</th>
                  <th className="text-left pb-3 font-medium">Department</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm">{user.email}</td>
                    <td className="py-3">
                      <Badge variant="outline" className={`${getRoleColor(user.role)} border-0`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">{user.department}</td>
                    <td className="py-3">
                      <Badge variant={user.status === "active" ? "success" : "secondary"}>
                        {user.status}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
