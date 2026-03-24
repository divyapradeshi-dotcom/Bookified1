"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Show,
  SignInButton,
  UserButton, useUser
} from "@clerk/nextjs";

const navItems = [
  { label: "Library", href: "/" },
  { label: "Add New", href: "/books/new" },
];

const Navbar = () => {
  const pathname = usePathname();
  const {user}= useUser();
  return (
    <header className="w-full fixed z-50 bg-(--bg-primary)">
      <div className="wrapper navbar-height py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/my-app/public" className="flex gap-0.5 items-center">
          <Image
            src="/assets/logo.png"
            alt="Bookified"
            width={42}
            height={26}
          />
          <span className="logo-text">Bookified</span>
        </Link>

        {/* Navigation */}
        <nav className="flex gap-7.5 items-center">
          
          {navItems.map(({ label, href }) => {
            const isActive =
              pathname === href ||
              (href !== "/" && pathname.startsWith(href));

            return (
              <Link
                key={label}
                href={href}
                className={`nav-link-base ${
                  isActive
                    ? "nav-link-active"
                    : "text-black hover:opacity-70"
                }`}
              >
                {label}
              </Link>
            );
          })}

          {/* Auth Section */}
          <div className="flex items-center gap-4">

            {/* Signed Out */}
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-black font-medium hover:opacity-70 transition">
                  Sign In
                </button>
              </SignInButton>
            </Show>

            {/* Signed In */}
            <Show when="signed-in">
              <div className="nav-user-link">
                <UserButton />
                 
                    
                  
                {user ?. firstName  && (
                  <Link href="/subscriptions"
                   className="nav-user-name">
                    {user.firstName}
                    </Link>
                )}
              </div>
            </Show>

          </div>

        </nav>
      </div>
    </header>
  );
};

export default Navbar;