import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/fixflow-logo.png"
                alt={BRAND.appName}
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-lg text-foreground">{BRAND.appName}</span>
            </div>
            <p className="text-sm text-text-tertiary">
              Enterprise CMMS platform for modern facility management.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Product</h4>
            <ul className="space-y-2 text-sm text-text-tertiary">
              <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/demo" className="hover:text-primary transition-colors">Book a Demo</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-text-tertiary">
              <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-text-tertiary">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-primary transition-colors">Security</Link></li>
              <li><Link href="/compliance" className="hover:text-primary transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-text-tertiary">
          <p>&copy; {new Date().getFullYear()} {BRAND.appName}. All rights reserved.</p>
          <p className="text-xs mt-1">{BRAND.ownedBy}</p>
        </div>
      </div>
    </footer>
  );
}
