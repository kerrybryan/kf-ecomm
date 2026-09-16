'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Package,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import BrandLogo from '@/components/ui/BrandLogo';

// Mega-menu data: rooms with image + description
const MEGA_MENU_ROOMS = [
  {
    name: 'Living Room',
    slug: 'living-room',
    image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Sofas & Armchairs',
  },
  {
    name: 'Bedroom',
    slug: 'bedroom',
    image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Beds & Nightstands',
  },
  {
    name: 'Dining Room',
    slug: 'dining-room',
    image: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Tables & Chairs',
  },
  {
    name: 'Home Office',
    slug: 'home-office',
    image: 'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Desks & Task Chairs',
  },
  {
    name: 'Outdoor',
    slug: 'outdoor',
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Patio & Lounge',
  },
  {
    name: 'Lighting & Decor',
    slug: 'lighting-decor',
    image: 'https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Pendants & Accents',
  },
];


export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemsCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
    setMobileSearchOpen(false);
    setActiveDropdown(null);
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        id="site-header"
        className={`w-full bg-white transition-all duration-200 z-40 sticky top-0 ${
          isScrolled
            ? 'shadow-sm border-b border-stone-200 py-2.5 bg-white/97 backdrop-blur-md'
            : 'border-b border-stone-100 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-6">

            {/* 1. Left Group: Hamburger + Logo + Nav */}
            <div className="flex items-center gap-4 lg:gap-7 shrink-0">
              {/* Mobile Hamburger */}
              <button
                id="mobile-menu-button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-stone-800 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors -ml-2"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Brand Logo with Official Icon Mark */}
              <BrandLogo variant="terracotta" size="md" />

              {/* Primary Nav */}
              <nav
                id="primary-nav"
                className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium text-stone-800"
              >
                {/* Shop Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('shop')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href="/shop"
                    id="nav-shop"
                    className={`py-1.5 flex items-center gap-1 transition-colors hover:text-[#B8551F] group/link relative ${
                      pathname === '/shop' ? 'text-[#B8551F] font-semibold' : 'text-stone-800'
                    }`}
                  >
                    <span>Shop</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                        activeDropdown === 'shop' ? 'rotate-180 text-[#B8551F]' : ''
                      }`}
                    />
                    {/* Active underline */}
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#B8551F] scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left duration-200 rounded-full" />
                  </Link>

                  {/* Simple shop dropdown */}
                  {activeDropdown === 'shop' && (
                    <div className="absolute top-full left-0 w-48 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50">
                      {[
                        { label: 'All Furniture', href: '/shop' },
                        { label: 'Best Sellers', href: '/shop?sort=featured' },
                        { label: 'New Arrivals', href: '/shop?sort=newest' },
                        { label: 'Deals & Offers', href: '/shop?sort=featured' },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-[#B8551F] transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rooms Mega-Menu */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('rooms')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    id="nav-rooms"
                    type="button"
                    className={`py-1.5 flex items-center gap-1 transition-colors hover:text-[#B8551F] relative group/link ${
                      activeDropdown === 'rooms' ? 'text-[#B8551F]' : 'text-stone-800'
                    }`}
                  >
                    <span>Rooms</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                        activeDropdown === 'rooms' ? 'rotate-180 text-[#B8551F]' : ''
                      }`}
                    />
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#B8551F] scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left duration-200 rounded-full" />
                  </button>

                  {/* MEGA MENU PANEL */}
                  {activeDropdown === 'rooms' && (
                    <div
                      id="rooms-mega-menu"
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[640px] bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 z-50"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">
                        Shop by Room
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {MEGA_MENU_ROOMS.map((room) => (
                          <Link
                            key={room.slug}
                            href={`/shop?category=${encodeURIComponent(room.slug)}`}
                            className="group/room flex flex-col rounded-xl overflow-hidden border border-stone-100 hover:border-[#B8551F]/40 hover:shadow-md transition-all duration-200"
                          >
                            <div className="relative h-24 overflow-hidden bg-stone-100">
                              <img
                                src={room.image}
                                alt={room.name}
                                className="w-full h-full object-cover object-center group-hover/room:scale-105 transition-transform duration-400"
                              />
                            </div>
                            <div className="px-3 py-2">
                              <p className="text-xs font-bold text-stone-900 group-hover/room:text-[#B8551F] transition-colors">
                                {room.name}
                              </p>
                              <p className="text-[10px] text-stone-500 mt-0.5">{room.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center">
                        <span className="text-[11px] text-stone-500">
                          All handcrafted in Addis Ababa
                        </span>
                        <Link
                          href="/shop"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B8551F] hover:text-[#8F4116] transition-colors"
                        >
                          View All Furniture
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {[
                  { label: 'Deals', href: '/shop?sort=featured', id: 'nav-deals' },
                  { label: 'Custom Order', href: '/custom-order', id: 'nav-custom' },
                  { label: 'Contact', href: '/contact', id: 'nav-contact' },
                ].map((link) => (
                  <Link
                    key={link.id}
                    id={link.id}
                    href={link.href}
                    className="py-1.5 transition-colors hover:text-[#B8551F] text-stone-800 relative group/link"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#B8551F] scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left duration-200 rounded-full" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* 2. Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg lg:max-w-xl mx-2">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <div className="w-full flex items-center bg-[#F2F2F2] hover:bg-[#EBEBEB] focus-within:bg-white focus-within:ring-2 focus-within:ring-stone-900 border border-transparent rounded-full px-4 py-2.5 transition-all">
                  <Search className="w-4 h-4 text-stone-500 mr-2.5 shrink-0" />
                  <input
                    id="desktop-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What are you looking for?"
                    className="w-full bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-stone-400 hover:text-stone-600 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* 3. Right: Utility Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Mobile Search */}
              <button
                id="mobile-search-button"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden p-2 text-stone-800 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Account */}
              <div className="relative">
                {isAuthenticated ? (
                  <button
                    id="user-account-button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-full hover:bg-stone-100 transition-colors text-xs font-medium text-stone-800"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#B8551F] text-white flex items-center justify-center text-xs font-bold">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="hidden lg:inline font-medium max-w-[110px] truncate">
                      Hi, {user?.name?.split(' ')[0] || 'User'}
                    </span>
                  </button>
                ) : (
                  <Link
                    id="login-link"
                    href="/login"
                    className="flex items-center gap-2 py-1.5 px-2.5 rounded-full hover:bg-stone-100 transition-colors text-xs font-medium text-stone-800"
                    aria-label="Sign in"
                  >
                    <UserIcon className="w-5 h-5 text-stone-700 shrink-0" />
                    <span className="hidden lg:inline">Hi! Log in or sign up</span>
                  </Link>
                )}

                {userDropdownOpen && isAuthenticated && (
                  <div
                    id="user-dropdown"
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-[11px] text-stone-500">Signed in as</p>
                      <p className="text-xs font-semibold text-stone-900 truncate">{user?.name}</p>
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 text-stone-400" />
                      <span>Account Dashboard</span>
                    </Link>
                    <Link
                      href="/account#orders"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Package className="w-4 h-4 text-stone-400" />
                      <span>Order History</span>
                    </Link>
                    <div className="border-t border-stone-100 mt-1 pt-1">
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

              {/* Wishlist */}
              <Link
                id="wishlist-link"
                href="/wishlist"
                className="relative p-2 text-stone-800 hover:text-[#B8551F] hover:bg-stone-100 rounded-full transition-colors hidden sm:flex"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#B8551F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart — amber badge */}
              <button
                id="cart-button"
                onClick={openCart}
                className="relative p-2 text-stone-800 hover:text-[#B8551F] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemsCount > 0 && (
                  <span className="absolute top-1 right-0.5 bg-[#D99A2B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {itemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Expandable Search Bar */}
          {mobileSearchOpen && (
            <div className="mt-3 pt-3 border-t border-stone-100 md:hidden">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="w-full flex items-center bg-[#F2F2F2] rounded-full px-4 py-2">
                  <Search className="w-4 h-4 text-stone-500 mr-2 shrink-0" />
                  <input
                    id="mobile-search"
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What are you looking for?"
                    className="w-full bg-transparent text-xs text-stone-900 placeholder:text-stone-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setMobileSearchOpen(false)}
                    className="p-1 text-stone-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            id="mobile-drawer"
            className="fixed inset-y-0 left-0 max-w-xs w-full bg-white p-6 shadow-2xl z-10 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                {/* Mobile logo */}
                <BrandLogo variant="terracotta" size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-stone-700 hover:text-stone-900 rounded-md"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-1 text-sm font-medium text-stone-800">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Shop All', href: '/shop' },
                  { label: 'Living Room', href: '/shop?category=living-room' },
                  { label: 'Bedroom', href: '/shop?category=bedroom' },
                  { label: 'Dining Room', href: '/shop?category=dining-room' },
                  { label: 'Home Office', href: '/shop?category=home-office' },
                  { label: 'Lighting & Decor', href: '/shop?category=lighting-decor' },
                  { label: 'Outdoor', href: '/shop?category=outdoor' },
                  { label: 'Custom Order', href: '/custom-order' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Trade & Agents', href: '/become-an-agent' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-2.5 px-3 rounded-lg hover:bg-[#FAF8F5] hover:text-[#B8551F] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-stone-900">{user?.name}</p>
                    <p className="text-[11px] text-stone-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs text-rose-600 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center bg-[#B8551F] hover:bg-[#8F4116] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Log In / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
