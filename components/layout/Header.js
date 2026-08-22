'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Package,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemsCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setActiveDropdown(null);
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`w-full bg-[#F3ECE1] transition-all duration-300 z-40 sticky top-0 ${
          isScrolled
            ? 'shadow-xs border-b border-[#DCD1BE] py-3 bg-[#F3ECE1]/95 backdrop-blur-xs'
            : 'py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Logo Placeholder (130x40px, subtle dashed border, blends into page) */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 text-[#2B2620] hover:text-[#A8875E] -ml-1.5"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link
                href="/"
                className="w-[130px] h-[40px] border border-dashed border-[#DCD1BE] hover:border-[#A8875E] rounded-md bg-[#EAE1D2]/40 flex items-center justify-center transition-colors shrink-0"
                title="Logo Placeholder"
                aria-label="Homepage"
              >
                <span className="sr-only">Homepage</span>
              </Link>
            </div>

            {/* Center: Primary Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/"
                className={`text-[12px] uppercase tracking-[0.14em] font-medium transition-colors hover:text-[#A8875E] ${
                  pathname === '/' ? 'text-[#A8875E] font-semibold' : 'text-[#2B2620]'
                }`}
              >
                Home
              </Link>

              {/* Shop Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('shop')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href="/shop"
                  className="flex items-center gap-1 text-[12px] uppercase tracking-[0.14em] font-medium text-[#2B2620] hover:text-[#A8875E] py-1.5 transition-colors"
                >
                  <span>Shop</span>
                  <ChevronDown className="w-3 h-3 text-[#6B6459]" />
                </Link>

                {activeDropdown === 'shop' && (
                  <div className="absolute top-full left-0 w-52 bg-white rounded-xl shadow-xl border border-[#DCD1BE] py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <Link
                      href="/shop"
                      className="block px-4 py-2 text-xs font-medium text-[#2B2620] hover:bg-[#F3ECE1] hover:text-[#A8875E]"
                    >
                      All Furniture
                    </Link>
                    <Link
                      href="/shop?sort=featured"
                      className="block px-4 py-2 text-xs text-[#2B2620] hover:bg-[#F3ECE1] hover:text-[#A8875E]"
                    >
                      Best Sellers
                    </Link>
                    <Link
                      href="/shop?sort=newest"
                      className="block px-4 py-2 text-xs text-[#2B2620] hover:bg-[#F3ECE1] hover:text-[#A8875E]"
                    >
                      New Arrivals
                    </Link>
                  </div>
                )}
              </div>

              {/* Rooms Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('rooms')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-[12px] uppercase tracking-[0.14em] font-medium text-[#2B2620] hover:text-[#A8875E] py-1.5 transition-colors cursor-pointer"
                >
                  <span>Rooms</span>
                  <ChevronDown className="w-3 h-3 text-[#6B6459]" />
                </button>

                {activeDropdown === 'rooms' && (
                  <div className="absolute top-full left-0 w-56 bg-white rounded-xl shadow-xl border border-[#DCD1BE] py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <Link
                      href="/categories/living-room"
                      className="block px-4 py-2 text-xs text-[#2B2620] hover:bg-[#F3ECE1] hover:text-[#A8875E]"
                    >
                      Living Room
                    </Link>
                    <Link
                      href="/categories/bedroom"
                      className="block px-4 py-2 text-xs text-[#2B2620] hover:bg-[#F3ECE1] hover:text-[#A8875E]"
                    >
                      Bedroom
                    </Link>
                    <Link
                      href="/categories/dining-room"
                      className="block px-4 py-2 text-xs text-[#2B2620] hover:bg-[#F3ECE1] hover:text-[#A8875E]"
                    >
                      Dining Room
                    </Link>
                    <Link
                      href="/categories/home-office"
                      className="block px-4 py-2 text-xs text-[#2B2620] hover:bg-[#F3ECE1] hover:text-[#A8875E]"
                    >
                      Home Office
                    </Link>
                    <Link
                      href="/categories/lighting-decor"
                      className="block px-4 py-2 text-xs text-[#2B2620] hover:bg-[#F3ECE1] hover:text-[#A8875E]"
                    >
                      Lighting & Decor
                    </Link>
                    <Link
                      href="/categories/outdoor"
                      className="block px-4 py-2 text-xs text-[#2B2620] hover:bg-[#F3ECE1] hover:text-[#A8875E]"
                    >
                      Outdoor
                    </Link>
                  </div>
                )}
              </div>

              {/* Collections Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('collections')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-[12px] uppercase tracking-[0.14em] font-medium text-[#2B2620] hover:text-[#A8875E] py-1.5 transition-colors cursor-pointer"
                >
                  <span>Collections</span>
                  <ChevronDown className="w-3 h-3 text-[#6B6459]" />
                </button>

                {activeDropdown === 'collections' && (
                  <div className="absolute top-full left-0 w-60 bg-white rounded-xl shadow-xl border border-[#DCD1BE] py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <Link
                      href="/shop?material=Solid Oak"
                      className="block px-4 py-2 text-xs text-[#2B2620] hover:bg-[#F3ECE1] hover:text-[#A8875E]"
                    >
                      Solid White Oak Series
                    </Link>
                    <Link
                      href="/shop?material=Bouclé"
                      className="block px-4 py-2 text-xs text-[#2B2620] hover:bg-[#F3ECE1] hover:text-[#A8875E]"
                    >
                      Bouclé Sculptural Seating
                    </Link>
                    <Link
                      href="/shop?material=Travertine Stone"
                      className="block px-4 py-2 text-xs text-[#2B2620] hover:bg-[#F3ECE1] hover:text-[#A8875E]"
                    >
                      Italian Travertine Tables
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/become-an-agent"
                className="text-[12px] uppercase tracking-[0.14em] font-medium text-[#2B2620] hover:text-[#A8875E] transition-colors"
              >
                About Us
              </Link>

              <Link
                href="/custom-order"
                className="text-[12px] uppercase tracking-[0.14em] font-medium text-[#2B2620] hover:text-[#A8875E] transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* Right: Utility Icons */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-[#2B2620] hover:text-[#A8875E] hover:bg-[#EAE1D2]/50 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-2 text-[#2B2620] hover:text-[#A8875E] hover:bg-[#EAE1D2]/50 rounded-full transition-colors hidden sm:flex"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#1A1613] text-[#F3ECE1] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Sign In */}
              <div className="relative">
                {isAuthenticated ? (
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#EAE1D2]/50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#1A1613] text-[#F3ECE1] flex items-center justify-center text-xs font-semibold">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="p-2 text-[#2B2620] hover:text-[#A8875E] hover:bg-[#EAE1D2]/50 rounded-full transition-colors flex items-center"
                    aria-label="Sign in"
                  >
                    <UserIcon className="w-5 h-5" />
                  </Link>
                )}

                {userDropdownOpen && isAuthenticated && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#DCD1BE] py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2 border-b border-[#DCD1BE]">
                      <p className="text-xs text-[#6B6459]">Signed in as</p>
                      <p className="text-sm font-semibold text-[#1A1613] truncate">{user?.name}</p>
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#2B2620] hover:bg-[#F3ECE1]"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 text-[#6B6459]" />
                      <span>Account Dashboard</span>
                    </Link>
                    <Link
                      href="/account#orders"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#2B2620] hover:bg-[#F3ECE1]"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Package className="w-4 h-4 text-[#6B6459]" />
                      <span>Order History</span>
                    </Link>
                    <div className="border-t border-[#DCD1BE] mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Bag */}
              <button
                onClick={openCart}
                className="relative p-2 text-[#2B2620] hover:text-[#A8875E] hover:bg-[#EAE1D2]/50 rounded-full transition-colors"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemsCount > 0 && (
                  <span className="absolute top-1 right-0.5 bg-[#1A1613] text-[#F3ECE1] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {itemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-[#DCD1BE] relative">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#6B6459] mb-3">
              Search Furniture Catalog
            </h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search sofas, oak dining tables, travertine stone, armchairs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F3ECE1] border border-[#DCD1BE] rounded-xl px-4 py-3.5 pl-11 text-[#2B2620] placeholder:text-[#6B6459] focus:outline-none focus:ring-2 focus:ring-[#1A1613] focus:bg-white text-sm"
              />
              <Search className="w-5 h-5 text-[#6B6459] absolute left-3.5 top-3.5" />
              <button
                type="submit"
                className="absolute right-2.5 top-2 bg-[#1A1613] text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-[#332c26]"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#F3ECE1] p-6 shadow-2xl z-10 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#DCD1BE]">
                <div className="w-[110px] h-[36px] border border-dashed border-[#DCD1BE] rounded-md bg-[#EAE1D2]" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#2B2620]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-3 text-xs font-semibold uppercase tracking-wider text-[#2B2620]">
                <Link href="/" className="py-2 border-b border-[#DCD1BE]/50">Home</Link>
                <Link href="/shop" className="py-2 border-b border-[#DCD1BE]/50">Shop All</Link>
                <Link href="/categories/living-room" className="py-2 border-b border-[#DCD1BE]/50">Living Room</Link>
                <Link href="/categories/bedroom" className="py-2 border-b border-[#DCD1BE]/50">Bedroom</Link>
                <Link href="/categories/dining-room" className="py-2 border-b border-[#DCD1BE]/50">Dining Room</Link>
                <Link href="/categories/home-office" className="py-2 border-b border-[#DCD1BE]/50">Home Office</Link>
                <Link href="/categories/lighting-decor" className="py-2 border-b border-[#DCD1BE]/50">Lighting & Decor</Link>
                <Link href="/categories/outdoor" className="py-2 border-b border-[#DCD1BE]/50">Outdoor</Link>
                <Link href="/become-an-agent" className="py-2 border-b border-[#DCD1BE]/50">About Us</Link>
                <Link href="/custom-order" className="py-2 border-b border-[#DCD1BE]/50">Contact</Link>
              </div>
            </div>

            <div className="pt-6 border-t border-[#DCD1BE]">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#1A1613]">{user?.name}</p>
                    <p className="text-[11px] text-[#6B6459]">{user?.email}</p>
                  </div>
                  <button onClick={logout} className="text-xs text-rose-600 font-medium">
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center bg-[#1A1613] text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-[#332c26]"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
