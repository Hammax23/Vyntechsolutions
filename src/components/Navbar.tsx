"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import VynTechLogo from "./VynTechLogo";

// Search data - all searchable pages and services
const searchData = [
  { title: "Home", href: "/", category: "Pages" },
  { title: "About Us", href: "/about", category: "Pages" },
  { title: "Blog", href: "/blog", category: "Pages" },
  { title: "Careers", href: "/careers", category: "Pages" },
  { title: "Contact Us", href: "/lets-talk-business", category: "Pages" },
  { title: "Web Development", href: "/services/web-development", category: "Services" },
  { title: "Mobile App Development", href: "/services/mobile-app-development", category: "Services" },
  { title: "Cloud Solutions", href: "/services/cloud-solutions", category: "Services" },
  { title: "AI/ML Solutions", href: "/services/ai-ml-solutions", category: "Services" },
  { title: "DevOps & CI/CD", href: "/services/devops-cicd", category: "Services" },
  { title: "UI/UX Design", href: "/services/ui-ux-design", category: "Services" },
  { title: "E-commerce Solutions", href: "/services/ecommerce-solutions", category: "Services" },
  { title: "Custom Software Development", href: "/services/custom-software-development", category: "Services" },
  { title: "SEO/Digital Marketing", href: "/services/seo-digital-marketing", category: "Services" },
  { title: "Maintenance & Support", href: "/services/maintenance-support", category: "Services" },
];

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof searchData>([]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState({ code: "EN", name: "English", flag: "🇨🇦" });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const languages = [
    { code: "EN", name: "English", flag: "🇨🇦" },
    { code: "FR", name: "Français", flag: "🇨🇦" },
  ];

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const filtered = searchData.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchQuery]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };
    if (isSearchOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      if (!isMobileMenuOpen) {
        document.body.style.overflow = "unset";
      }
    };
  }, [isSearchOpen, isMobileMenuOpen]);

  const openSearch = () => {
    setIsSearchOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchSelect = (href: string) => {
    closeSearch();
    router.push(href);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setMobileAccordion(null);
  };

  const toggleMobileAccordion = (menu: string) => {
    setMobileAccordion(mobileAccordion === menu ? null : menu);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-white/20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Main Navbar */}
          <div className="flex items-center justify-between py-3 lg:py-4">
            {/* Left Section - Logo */}
            <div className="flex items-center z-50">
              <div className="flex flex-col">
                <Link href="/">
                  <VynTechLogo onClick={() => setIsMobileMenuOpen(false)} />
                </Link>
              </div>
            </div>

            {/* Center Section - Navigation Links (Desktop) */}
            <div className="flex-1 flex justify-center">
              <div className="hidden lg:flex items-center gap-8">
                {/* Services */}
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter("services")}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center gap-1 text-white text-sm font-light hover:text-white/80 transition-colors py-2">
                    WHAT WE DO
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Industries */}
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter("industries")}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center gap-1 text-white text-sm font-light hover:text-white/80 transition-colors py-2">
                    WHO WE HELP
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Blog */}
                <Link href="/blog" className="text-white text-sm font-light hover:text-white/80 transition-colors py-2">
                  BLOG
                </Link>

                {/* About */}
                <Link href="/about" className="text-white text-sm font-light hover:text-white/80 transition-colors py-2">
                  ABOUT
                </Link>
              </div>
            </div>

            {/* Right Section (Desktop) */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/careers" className="text-white text-sm font-light hover:text-white/80 transition-colors">
                Careers
              </Link>

              {/* Let's Talk Business Button */}
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                className="border border-white text-white px-6 py-2 text-sm font-light tracking-wider hover:bg-white hover:text-black transition-all duration-300"
              >
                LET&apos;S TALK BUSINESS
              </button>

              {/* Search Icon */}
              <button 
                onClick={openSearch}
                className="text-white hover:text-white/80 transition-colors"
                aria-label="Open search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Language Dropdown */}
              <div ref={langRef} className="relative">
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1 text-white hover:text-white/80 transition-colors"
                >
                  <span className="text-sm">{selectedLang.flag}</span>
                  <span className="text-sm font-light">{selectedLang.code}</span>
                  {/* <svg className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg> */}
                </button>

              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-white z-50 p-2 -mr-2"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-white transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-full h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-full h-0.5 bg-white transform transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={toggleMobileMenu}
      />

      {/* Mobile Menu Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-40 lg:hidden transform transition-transform duration-500 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto pt-20 pb-8 px-6">
          {/* Mobile Navigation Links */}
          <nav className="space-y-1">
            {/* WHAT WE DO Accordion */}
            <div className="border-b border-white/10">
              <button
                onClick={() => toggleMobileAccordion('services')}
                className="w-full flex items-center justify-between py-4 text-white text-lg font-light tracking-wide"
              >
                WHAT WE DO
                <svg 
                  className={`w-4 h-4 transform transition-transform duration-300 ${mobileAccordion === 'services' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileAccordion === 'services' ? 'max-h-[800px] pb-4' : 'max-h-0'}`}>
                <div className="pl-4 space-y-4">
                  <Link href="/services/web-development" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Web Development</Link>
                  <Link href="/services/mobile-app-development" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Mobile App Development</Link>
                  <Link href="/services/cloud-solutions" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Cloud Solutions</Link>
                  <Link href="/services/ai-ml-solutions" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">AI/ML Solutions</Link>
                  <Link href="/services/devops-cicd" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">DevOps & CI/CD</Link>
                  <Link href="/services/ui-ux-design" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">UI/UX Design</Link>
                  <Link href="/services/ecommerce-solutions" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">E-commerce Solutions</Link>
                  <Link href="/services/custom-software-development" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Custom Software Development</Link>
                  <Link href="/services/seo-digital-marketing" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">SEO/Digital Marketing</Link>
                  <Link href="/services/maintenance-support" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Maintenance & Support</Link>
                  
                  {/* Tax & Accounting CTA */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-emerald-400 text-xs font-semibold mb-3">TAX & ACCOUNTING</p>
                    <Link href="/services/tax-accounting" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-emerald-400 transition-colors mb-2">Comprehensive Tax & Accounting</Link>
                    <Link href="/services/tax-accounting" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-emerald-400 transition-colors mb-2">Business Incorporation & CFO</Link>
                    <Link href="/services/tax-accounting" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-emerald-400 transition-colors mb-2">Financial Planning & Forecasting</Link>
                    <Link href="/services/tax-accounting" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-emerald-400 transition-colors mb-3">Government Grants Assistance</Link>
                    <Link 
                      href="/services/tax-accounting" 
                      onClick={toggleMobileMenu}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:from-emerald-500 hover:to-emerald-400 transition-all"
                    >
                      View All Tax Services
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* WHAT WE HELP Accordion */}
            <div className="border-b border-white/10">
              <button
                onClick={() => toggleMobileAccordion('industries')}
                className="w-full flex items-center justify-between py-4 text-white text-lg font-light tracking-wide"
              >
                WHO WE HELP
                <svg 
                  className={`w-4 h-4 transform transition-transform duration-300 ${mobileAccordion === 'industries' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileAccordion === 'industries' ? 'max-h-[500px] pb-4' : 'max-h-0'}`}>
                <div className="pl-4 space-y-3">
                  <Link href="/industries/healthcare" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Healthcare</Link>
                  <Link href="/industries/finance-banking" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Finance & Banking</Link>
                  <Link href="/industries/ecommerce-retail" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">E-commerce & Retail</Link>
                  <Link href="/industries/education" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Education & E-learning</Link>
                  <Link href="/industries/real-estate" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Real Estate</Link>
                  <Link href="/industries/logistics" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Logistics & Transportation</Link>
                  <Link href="/industries/entertainment" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Entertainment & Media</Link>
                  <Link href="/industries/manufacturing" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Manufacturing</Link>
                  <Link href="/industries/hospitality" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Hospitality & Travel</Link>
                  <Link href="/industries/telecommunications" onClick={toggleMobileMenu} className="block text-white/70 text-sm hover:text-[#00B4FF] transition-colors">Telecommunications</Link>
                </div>
              </div>
            </div>

            {/* Simple Links */}
            <Link 
              href="/blog"
              onClick={toggleMobileMenu}
              className="block py-4 text-white text-lg font-light tracking-wide border-b border-white/10 hover:text-[#00B4FF] transition-colors"
            >
              BLOG
            </Link>

            <Link 
              href="/about"
              onClick={toggleMobileMenu}
              className="block py-4 text-white text-lg font-light tracking-wide border-b border-white/10 hover:text-[#00B4FF] transition-colors"
            >
              ABOUT
            </Link>

            <Link 
              href="/careers" 
              onClick={toggleMobileMenu}
              className="block py-4 text-white text-lg font-light tracking-wide border-b border-white/10 hover:text-[#00B4FF] transition-colors"
            >
              CAREERS
            </Link>
          </nav>

          {/* Mobile CTA Button */}
          <div className="mt-8">
            <button 
              onClick={() => {
                toggleMobileMenu();
                window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'));
              }}
              className="block w-full border border-white text-white py-4 text-sm font-light tracking-widest hover:bg-white hover:text-black transition-all duration-300 text-center"
            >
              LET&apos;S TALK BUSINESS
            </button>
          </div>

          {/* Mobile Footer Section */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              {/* Search */}
              <button 
                onClick={openSearch}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm">Search</span>
              </button>

              {/* Language Selector */}
              <div className="flex items-center gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedLang.code === lang.code
                        ? 'bg-white/20 text-white'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mega Dropdown Menus */}
      {/* Services Mega Menu */}
      {activeDropdown === "services" && (
        <div
          className="fixed top-[72px] left-0 right-0 z-40 bg-white shadow-lg"
          onMouseEnter={() => handleMouseEnter("services")}
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-[1400px] mx-auto px-6 py-8">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - Featured */}
              <div className="col-span-3 border-r border-gray-200 pr-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">WHAT WE DO</h3>
                <div className="mb-4">
                  <Image
                    src="/whatwedo.png"
                    alt="What We Do"
                    width={200}
                    height={120}
                    className="w-4/5 h-36 object-cover rounded-lg ml-0"
                  />
                </div>
                <p className="text-gray-700 text-sm">
                  Why data standards matter & why they&apos;re important
                </p>
              </div>

              {/* Services Columns */}
              <div className="col-span-5 grid grid-cols-2 gap-y-4 gap-x-4 border-r border-gray-200 pr-6">
                <Link href="/services/web-development" className="flex items-center gap-2 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  <span className="text-sm">Web Development</span>
                </Link>

                <Link href="/services/mobile-app-development" className="flex items-center gap-2 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                  <span className="text-sm">Mobile Apps</span>
                </Link>

                <Link href="/services/cloud-solutions" className="flex items-center gap-2 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                  </svg>
                  <span className="text-sm">Cloud Solutions</span>
                </Link>

                <Link href="/services/ai-ml-solutions" className="flex items-center gap-2 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  <span className="text-sm">AI/ML Solutions</span>
                </Link>

                <Link href="/services/devops-cicd" className="flex items-center gap-2 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">DevOps & CI/CD</span>
                </Link>

                <Link href="/services/ui-ux-design" className="flex items-center gap-2 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128z" />
                  </svg>
                  <span className="text-sm">UI/UX Design</span>
                </Link>

                <Link href="/services/ecommerce-solutions" className="flex items-center gap-2 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  <span className="text-sm">E-commerce</span>
                </Link>

                <Link href="/services/custom-software-development" className="flex items-center gap-2 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                  <span className="text-sm">Custom Software</span>
                </Link>

                <Link href="/services/seo-digital-marketing" className="flex items-center gap-2 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                  </svg>
                  <span className="text-sm">SEO & Marketing</span>
                </Link>

                <Link href="/services/maintenance-support" className="flex items-center gap-2 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                  </svg>
                  <span className="text-sm">Support</span>
                </Link>
              </div>

              {/* Right Column - Tax & Accounting CTA */}
              <div className="col-span-4 bg-gradient-to-br from-[#0d9488] via-[#059669] to-[#047857] rounded-2xl p-5 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10">
                  <h4 className="text-white font-bold text-base mb-3">Tax & Accounting Services</h4>
                  
                  {/* Tax Service Pills */}
                  <div className="space-y-2 mb-4">
                    <Link href="/services/tax-accounting" className="block border border-white/40 text-white text-xs px-3 py-2 rounded-full hover:bg-white hover:text-[#059669] transition-all duration-300 truncate">
                      Comprehensive Tax & Accounting
                    </Link>
                    <Link href="/services/tax-accounting" className="block border border-white/40 text-white text-xs px-3 py-2 rounded-full hover:bg-white hover:text-[#059669] transition-all duration-300 truncate">
                      Business Incorporation & CFO
                    </Link>
                    <Link href="/services/tax-accounting" className="block border border-white/40 text-white text-xs px-3 py-2 rounded-full hover:bg-white hover:text-[#059669] transition-all duration-300 truncate">
                      Financial Planning & Forecasting
                    </Link>
                    <Link href="/services/tax-accounting" className="block border border-white/40 text-white text-xs px-3 py-2 rounded-full hover:bg-white hover:text-[#059669] transition-all duration-300 truncate">
                      Government Grants Assistance
                    </Link>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/services/tax-accounting"
                    className="w-full bg-white text-[#059669] font-semibold py-2.5 px-4 rounded-lg hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 group text-sm"
                  >
                    <span>View All Services</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Industries Mega Menu */}
      {activeDropdown === "industries" && (
        <div
          className="fixed top-[72px] left-0 right-0 z-40 bg-white shadow-lg"
          onMouseEnter={() => handleMouseEnter("industries")}
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-[1400px] mx-auto px-6 py-8">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-3 border-r border-gray-200 pr-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">WHO WE HELP</h3>
                <div className="mb-4">
                  <Image
                    src="/whowehelp.png"
                    alt="Who We Help"
                    width={200}
                    height={120}
                    className="w-4/5 h-36 object-cover rounded-lg ml-0"
                  />
                </div>
                <p className="text-gray-700 text-sm">
                  Transforming industries with innovative solutions
                </p>
              </div>
              <div className="col-span-9 grid grid-cols-2 gap-y-5 gap-x-8">
                <Link href="/industries/healthcare" className="flex items-center gap-3 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  <span className="text-sm">Healthcare</span>
                  <span className="text-[#00B4FF]">→</span>
                </Link>
                <Link href="/industries/finance-banking" className="flex items-center gap-3 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                  <span className="text-sm">Finance & Banking</span>
                  <span className="text-[#00B4FF]">→</span>
                </Link>
                <Link href="/industries/ecommerce-retail" className="flex items-center gap-3 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  <span className="text-sm">E-commerce & Retail</span>
                  <span className="text-[#00B4FF]">→</span>
                </Link>
                <Link href="/industries/education" className="flex items-center gap-3 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                  <span className="text-sm">Education & E-learning</span>
                  <span className="text-[#00B4FF]">→</span>
                </Link>
                <Link href="/industries/real-estate" className="flex items-center gap-3 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                  </svg>
                  <span className="text-sm">Real Estate</span>
                  <span className="text-[#00B4FF]">→</span>
                </Link>
                <Link href="/industries/logistics" className="flex items-center gap-3 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <span className="text-sm">Logistics & Transportation</span>
                  <span className="text-[#00B4FF]">→</span>
                </Link>
                <Link href="/industries/entertainment-media" className="flex items-center gap-3 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
                  </svg>
                  <span className="text-sm">Entertainment & Media</span>
                  <span className="text-[#00B4FF]">→</span>
                </Link>
                <Link href="/industries/manufacturing" className="flex items-center gap-3 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                  <span className="text-sm">Manufacturing</span>
                  <span className="text-[#00B4FF]">→</span>
                </Link>
                <Link href="/industries/hospitality-travel" className="flex items-center gap-3 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                  <span className="text-sm">Hospitality & Travel</span>
                  <span className="text-[#00B4FF]">→</span>
                </Link>
                <Link href="/industries/telecommunications" className="flex items-center gap-3 text-gray-700 hover:text-[#00B4FF] transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                  </svg>
                  <span className="text-sm">Telecommunications</span>
                  <span className="text-[#00B4FF]">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1a1a2e]/95 backdrop-blur-sm">
          {/* Close Button */}
          <button
            onClick={closeSearch}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            aria-label="Close search"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Search Container */}
          <div className="flex flex-col items-center justify-start pt-32 px-4">
            {/* Search Input */}
            <div className="w-full max-w-2xl">
              <div className="relative">
                <svg
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages, services..."
                  className="w-full bg-white/10 border border-white/20 rounded-full py-5 pl-16 pr-6 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchSelect(result.href)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-b-0"
                    >
                      <div>
                        <p className="text-white font-medium">{result.title}</p>
                        <p className="text-white/50 text-sm">{result.category}</p>
                      </div>
                      <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {searchQuery && searchResults.length === 0 && (
                <div className="mt-6 text-center">
                  <p className="text-white/50">No results found for &quot;{searchQuery}&quot;</p>
                </div>
              )}

              {/* Quick Links when no search */}
              {!searchQuery && (
                <div className="mt-8">
                  <p className="text-white/40 text-sm mb-4">Quick Links</p>
                  <div className="flex flex-wrap gap-3">
                    {searchData.slice(0, 6).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchSelect(item.href)}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyboard Hint */}
              <p className="mt-8 text-center text-white/30 text-sm">
                Press <kbd className="px-2 py-1 bg-white/10 rounded text-white/50">ESC</kbd> to close
              </p>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
