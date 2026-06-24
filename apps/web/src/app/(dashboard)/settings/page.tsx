'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, ChevronRight, Palette, Moon, Sun, Check } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { theme, mode, setTheme, setMode } = useTheme();

  const themes = [
    { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
    { id: 'ocean', name: 'Ocean', color: 'bg-blue-500' },
    { id: 'sunset', name: 'Sunset', color: 'bg-orange-500' },
    { id: 'royal', name: 'Royal', color: 'bg-purple-500' },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Settings</h1>
        <p className="text-muted-foreground">Family management and appearance settings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance Settings */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Appearance</CardTitle>
                <CardDescription>Customize the theme and palette</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Color Palette */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Color Palette</h3>
              <div className="flex gap-3">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                      t.color
                    } shadow-md hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${t.color.split('-')[1]}-500 ${
                      theme === t.id ? 'ring-4 ring-offset-2 ring-primary scale-110' : ''
                    }`}
                    title={t.name}
                  >
                    {theme === t.id && <Check className="h-5 w-5 text-white drop-shadow-md" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Theme Mode</h3>
              <div className="flex gap-3">
                <Button 
                  variant={mode === 'light' ? 'default' : 'outline'} 
                  className={`flex-1 rounded-xl h-12 transition-all ${mode === 'light' ? 'shadow-md scale-105' : 'hover:bg-muted'}`}
                  onClick={() => setMode('light')}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button 
                  variant={mode === 'dark' ? 'default' : 'outline'} 
                  className={`flex-1 rounded-xl h-12 transition-all ${mode === 'dark' ? 'shadow-md scale-105' : 'hover:bg-muted'}`}
                  onClick={() => setMode('dark')}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Relation Settings */}
        <Link href="/settings/relations">
          <Card className="glass-card h-full cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Relations</CardTitle>
                  <CardDescription>Manage global relation types</CardDescription>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure relations (e.g. Uncle, Cousin, Friend) used across all families when adding new members.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Event Types Settings */}
        <Link href="/settings/event-types">
          <Card className="glass-card h-full cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Event Types</CardTitle>
                  <CardDescription>Manage dropdown event types</CardDescription>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure event types (e.g. Mehndi, Barat, Valima) used when adding wedding events.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}