declare module 'next-auth/react' {
  import type { ClientSafeProvider, LiteralUnion, Session } from 'next-auth';
  import type { SignInAuthorizationParams, SignInOptions, SignInResponse } from 'next-auth/react';
  import type { SignOutParams, SignOutResponse } from 'next-auth/react';
  import type { BuiltInProviderType, RedirectableProviderType } from 'next-auth/providers';

  export function useSession<R extends boolean = false>(
    options?: { required?: R; onUnauthenticated?: () => void }
  ): {
    data: R extends true ? Session : Session | null;
    status: 'authenticated' | 'loading' | 'unauthenticated';
    update: (data?: any) => Promise<Session | null>;
  };

  export function SessionProvider(props: {
    children?: React.ReactNode;
    session?: Session | null;
    basePath?: string;
    baseUrl?: string;
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
    refetchWhenOffline?: boolean;
  }): JSX.Element;

  export function signIn<
    P extends RedirectableProviderType | undefined = undefined,
  >(
    provider?: LiteralUnion<
      P extends RedirectableProviderType ? P | BuiltInProviderType : BuiltInProviderType,
      string
    >,
    options?: SignInOptions,
    authorizationParams?: SignInAuthorizationParams
  ): Promise<
    P extends RedirectableProviderType ? SignInResponse | undefined : undefined
  >;

  export function signOut<R extends boolean = true>(
    options?: SignOutParams<R>
  ): Promise<R extends true ? undefined : SignOutResponse>;

  export function getProviders(): Promise<Record<string, ClientSafeProvider> | null>;

  export function getCsrfToken(): Promise<string>;

  export function getSession(options?: {
    event?: 'storage' | 'timer' | 'hidden' | string;
    triggerEvent?: boolean;
    broadcast?: boolean;
  }): Promise<Session | null>;
}
