'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { DevOpsHubLogo } from '@/components/DevOpsHubLogo';
import { ModernLoginBackground } from '@/components/ModernLoginBackground';
import Link from 'next/link';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Login attempt:', values);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Modern Animated Background */}
      <ModernLoginBackground />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {/* Login Card */}
          <Card className="w-full max-w-md border-2 border-blue-500/30 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-slate-950/80">
            <CardHeader className="space-y-2 pb-4 text-center">
              {/* Logo and App Name */}
              <div className="flex flex-col items-center space-y-2">
                <DevOpsHubLogo showText={false} size="md" className="text-cyan-400" />
                <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  DevOps Hub
                </h1>
              </div>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                Enter your credentials to access your workspace
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pb-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your username"
                            disabled={isLoading}
                            autoComplete="username"
                            className="h-11 text-base border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Password
                          </FormLabel>
                          <a
                            href="#"
                            className="text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
                          >
                            Forgot password?
                          </a>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              disabled={isLoading}
                              autoComplete="current-password"
                              className="h-11 text-base pr-10 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                              disabled={isLoading}
                            >
                              {showPassword ? '🙈' : '👁️'}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-10 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg mt-2"
                    disabled={isLoading}
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In <span className="ml-2">→</span>
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 text-center text-xs space-y-1 font-medium">
                <p className="text-gray-600 dark:text-gray-400 text-[11px]">© 2025 Sarjen Systems Pvt Ltd. All rights reserved.</p>
                <div className="flex items-center justify-center gap-2 text-[10px]">
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                    Privacy
                  </a>
                  <span className="text-gray-600 dark:text-gray-400">•</span>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                    Terms
                  </a>
                  <span className="text-gray-600 dark:text-gray-400">•</span>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                    Support
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
