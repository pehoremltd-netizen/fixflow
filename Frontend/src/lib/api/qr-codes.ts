function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fixflow-token");
}

export async function downloadQR(value: string, filename?: string): Promise<void> {
  const token = getToken();
  const res = await fetch("/api/qr-codes/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ value, filename }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to generate QR code" }));
    throw new Error(err.error || "Failed to generate QR code");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(filename || "qrcode").replace(/[^a-zA-Z0-9_-]/g, "-")}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
