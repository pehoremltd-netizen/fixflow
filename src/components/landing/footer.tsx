import Link from "next/link";
import { Wrench } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#222222] bg-black">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]">
                <Wrench className="h-4 w-4 text-black" />
              </div>
              <span className="font-bold text-lg text-white">FixFlow</span>
            </div>
            <p className="text-sm text-[#7A7A7A]">
              Enterprise CMMS platform for modern facility management.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white">Product</h4>
            <ul className="space-y-2 text-sm text-[#7A7A7A]">
              <li><Link href="/features" className="hover:text-[#D4AF37] transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-[#D4AF37] transition-colors">Pricing</Link></li>
              <li><Link href="/demo" className="hover:text-[#D4AF37] transition-colors">Book a Demo</Link></li>
              <li><Link href="/register" className="hover:text-[#D4AF37] transition-colors">Free Trial</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white">Company</h4>
            <ul className="space-y-2 text-sm text-[#7A7A7A]">
              <li><Link href="/about" className="hover:text-[#D4AF37] transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-[#D4AF37] transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-[#D4AF37] transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-[#D4AF37] transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-[#7A7A7A]">
              <li><Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#D4AF37] transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-[#D4AF37] transition-colors">Security</Link></li>
              <li><Link href="/compliance" className="hover:text-[#D4AF37] transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[#222222] text-center text-sm text-[#7A7A7A]">
          &copy; {new Date().getFullYear()} FixFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
