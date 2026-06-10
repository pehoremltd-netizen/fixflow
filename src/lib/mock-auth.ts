"use client";

const MOCK_USERS = [
  { id: "1", email: "admin@fixflow.com",      password: "Admin@2026!",      role: "admin",       name: "Alex Admin",       organization: "FixFlow HQ" },
  { id: "2", email: "manager@fixflow.com",    password: "Manager@2026!",    role: "manager",     name: "Maria Manager",     organization: "FixFlow HQ" },
  { id: "3", email: "supervisor@fixflow.com", password: "Supervisor@2026!", role: "supervisor",  name: "Sam Supervisor",  organization: "FixFlow HQ" },
  { id: "4", email: "staff@fixflow.com",      password: "Staff@2026!",      role: "staff",       name: "Sarah Staff",       organization: "FixFlow HQ" },
  { id: "5", email: "stakeholder@fixflow.com",password: "Stake@2026!",      role: "stakeholder", name: "Will Stakeholder", organization: "FixFlow HQ" },
  { id: "6", email: "tenant@fixflow.com",     password: "Tenant@2026!",     role: "tenant",      name: "Tom Tenant",      organization: "FixFlow HQ" },
  { id: "7", email: "demo@fixflow.com",       password: "Demo123!",         role: "admin",       name: "Demo Admin",       organization: "FixFlow Demo" },
];

export function mockLogin(email: string, password: string) {
  const registered = JSON.parse(localStorage.getItem("fixflow-registered-users") || "[]");
  const allUsers = [...MOCK_USERS, ...registered];
  const user = allUsers.find((u) => u.email === email && u.password === password);
  if (!user) return null;

  const session = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    organization: user.organization,
  };
  localStorage.setItem("fixflow-user", JSON.stringify(session));
  document.cookie = `fixflow-role=${user.role}; path=/; max-age=86400`;
  document.cookie = `fixflow-auth=1; path=/; max-age=86400`;
  document.cookie = `fixflow-user=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=86400`;
  return session;
}

export function mockRegister(data: {
  email: string;
  password: string;
  full_name: string;
  organization: string;
  role: string;
}) {
  const registered = JSON.parse(localStorage.getItem("fixflow-registered-users") || "[]");
  const allUsers = [...MOCK_USERS, ...registered];
  if (allUsers.find((u) => u.email === data.email)) {
    throw new Error("Email already registered");
  }
  const newUser = {
    id: Date.now().toString(),
    email: data.email,
    password: data.password,
    role: data.role,
    name: data.full_name,
    organization: data.organization,
  };
  registered.push(newUser);
  localStorage.setItem("fixflow-registered-users", JSON.stringify(registered));
  const session = {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
    organization: newUser.organization,
  };
  localStorage.setItem("fixflow-user", JSON.stringify(session));
  document.cookie = `fixflow-role=${newUser.role}; path=/; max-age=86400`;
  document.cookie = `fixflow-auth=1; path=/; max-age=86400`;
  document.cookie = `fixflow-user=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=86400`;
  return session;
}

export function mockLogout() {
  localStorage.removeItem("fixflow-user");
  document.cookie = "fixflow-role=; path=/; max-age=0";
  document.cookie = "fixflow-auth=; path=/; max-age=0";
  document.cookie = "fixflow-user=; path=/; max-age=0";
}

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("fixflow-user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
