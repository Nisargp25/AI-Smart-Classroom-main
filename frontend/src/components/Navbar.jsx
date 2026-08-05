import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  BookOpen,
  Trophy,
  Award,
  Code2,
  LayoutDashboard,
  Users,
  Menu,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { CampusAiLogo } from './CampusAiLogo';
import { AnimatedTitle } from './AnimatedTitle';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'teacher', 'admin'] },
    { href: '/lectures', label: 'Lectures', icon: BookOpen, roles: ['student', 'teacher', 'admin'] },
    { href: '/quizzes', label: 'Quizzes', icon: Award, roles: ['student', 'teacher', 'admin'] },
    { href: '/rankings', label: 'Rankings', icon: Trophy, roles: ['student', 'teacher', 'admin'] },
    { href: '/coding', label: 'Coding', icon: Code2, roles: ['student', 'teacher', 'admin'] },
    { href: '/admin', label: 'Admin', icon: Users, roles: ['admin'] },
  ];

  const filteredLinks = navLinks.filter(link => link.roles.includes(user?.role || 'student'));

  return (
    <header className="glass sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group" data-testid="nav-logo">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <CampusAiLogo className="h-6 w-6" />
            </div>
            <AnimatedTitle text="CampusAi" variant="shimmer" className="font-bold text-lg tracking-tight hidden sm:block" />
          </Link>

          {/* Desktop Navigation (only when signed in) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {filteredLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  data-testid={`nav-${link.label.toLowerCase()}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.href || location.pathname.startsWith(link.href + '/')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle"
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {user ? (
              <>
                {/* Local user avatar + dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.picture} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async () => { await logout(); navigate('/'); }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu */}
                <Sheet>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon" data-testid="mobile-menu-trigger">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72">
                    <nav className="flex flex-col gap-2 mt-8">
                      {filteredLinks.map(link => (
                        <Link
                          key={link.href}
                          to={link.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            location.pathname === link.href
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }`}
                        >
                          <link.icon className="w-5 h-5" />
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button size="sm" className="rounded-full shadow-lg shadow-primary/20" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
