'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Eye, EyeOff, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils/currency'
import {
  demoCredentialsLogin,
  selectArchetype,
} from '@/app/login/demo-actions'

type ArchetypeCardData = {
  id: string
  displayName: string
  displayNameEs: string
  description: string
  descriptionEs: string
  demoUsername: string
  demoPassword: string
  estrato: string
  city: string
  grossMonthlyIncomeCOP: number
  netMonthlyIncomeCOP: number
  tags: string[]
}

interface DemoArchetypePickerProps {
  archetypes: ArchetypeCardData[]
  errorMessage?: string
}

export function DemoArchetypePicker({
  archetypes,
  errorMessage,
}: DemoArchetypePickerProps) {
  const [revealPasswords, setRevealPasswords] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4 py-10 md:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">FinFlow</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Client archetype demo
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Explore FinFlow across six Colombian personas — from the
              disciplined saver to the over-leveraged aspirational. Every
              dashboard, chart, and number below is synthetic but grounded in
              DANE and Superfinanciera benchmarks.
            </p>
          </div>
        </header>

        <div className="flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Demo profiles — plaintext credentials.</p>
            <p className="text-red-700/80 dark:text-red-300/80">
              These accounts exist only when <code className="rounded bg-red-500/10 px-1 font-mono text-xs">NEXT_PUBLIC_USE_MOCK_DATA=true</code>.
              They never touch Supabase Auth. Do NOT use in production.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <Tabs defaultValue="pick" className="space-y-6">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="pick">Pick an archetype</TabsTrigger>
              <TabsTrigger value="login">Enter credentials</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pick" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {archetypes.map((archetype) => (
                <Card key={archetype.id} className="flex flex-col">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {archetype.displayName}
                        </CardTitle>
                        <CardDescription className="text-xs italic">
                          {archetype.displayNameEs}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {archetype.city} · Estrato {archetype.estrato}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {archetype.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] uppercase tracking-wide">
                          {tag.replace(/-/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      {archetype.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 rounded-md bg-muted/50 p-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Gross / mo</p>
                        <p className="font-semibold">
                          {formatCurrency(archetype.grossMonthlyIncomeCOP, 'COP')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net / mo</p>
                        <p className="font-semibold">
                          {formatCurrency(archetype.netMonthlyIncomeCOP, 'COP')}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 rounded-md border border-dashed border-border p-3 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Email</span>
                        <code className="font-mono text-[11px]">
                          {archetype.demoUsername}
                        </code>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Password</span>
                        <code className="font-mono text-[11px]">
                          {revealPasswords
                            ? archetype.demoPassword
                            : '•'.repeat(archetype.demoPassword.length)}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <form action={selectArchetype} className="w-full">
                      <input type="hidden" name="archetypeId" value={archetype.id} />
                      <Button type="submit" className="w-full">
                        Enter demo as this profile
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRevealPasswords((v) => !v)}
              >
                {revealPasswords ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide passwords
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Show passwords
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="login">
            <Card className="mx-auto w-full max-w-md">
              <CardHeader>
                <CardTitle>Classic demo login</CardTitle>
                <CardDescription>
                  Paste one of the demo emails and passwords from the picker tab.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={demoCredentialsLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo-email">Email</Label>
                    <Input
                      id="demo-email"
                      name="email"
                      type="email"
                      autoComplete="off"
                      placeholder="saver@demo.finflow"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-password">Password</Label>
                    <Input
                      id="demo-password"
                      name="password"
                      type="text"
                      autoComplete="off"
                      placeholder="DemoSaver!2026"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Enter demo
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Demo-only. No Supabase session is created. The cookie
                <code className="mx-1 font-mono">finflow_demo_archetype</code>
                is what powers the dashboard.
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
          <p>
            Need real Supabase auth?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Use the production login
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  )
}
