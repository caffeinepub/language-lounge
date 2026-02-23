import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import LiveLobby from './pages/LiveLobby';
import VoiceRoom from './pages/VoiceRoom';
import MessagesPage from './pages/MessagesPage';
import ChatConversation from './pages/ChatConversation';
import UserProfile from './pages/UserProfile';
import ProfileSetup from './pages/ProfileSetup';
import StrangerVideoCall from './pages/StrangerVideoCall';
import VoiceChatLobby from './pages/VoiceChatLobby';
import VideoChatLobby from './pages/VideoChatLobby';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: LayoutWrapper,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LiveLobby,
});

const voiceRoomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/room/$roomId',
  component: VoiceRoom,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  component: MessagesPage,
});

const chatConversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat/$roomId',
  component: ChatConversation,
});

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$userId',
  component: UserProfile,
});

const profileSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup',
  component: ProfileSetup,
});

const strangerVideoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stranger-video',
  component: StrangerVideoCall,
});

const voiceChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/voice-chat',
  component: VoiceChatLobby,
});

const videoChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/video-chat',
  component: VideoChatLobby,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  voiceRoomRoute,
  messagesRoute,
  chatConversationRoute,
  userProfileRoute,
  profileSetupRoute,
  strangerVideoRoute,
  voiceChatRoute,
  videoChatRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-terracotta/10 via-sage/10 to-peach/10">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Global Connect...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return <ProfileSetup />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppContent />
      <Toaster />
    </ThemeProvider>
  );
}
