import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import PageTransition from '../components/PageTransition';
import { ScreenErrorBoundary } from '../components/ErrorBoundary';

import { 
    ProfileSkeleton, 
    SkeletonHistory, 
    SkeletonImageCard
} from '../components/ui/Skeleton';

// Lazy Load Views — only essential routes
const HomeView = React.lazy(() => import("../views/HomeView"));
const GalleryView = React.lazy(() => import("../views/GalleryView"));
const ProfileView = React.lazy(() => import("../views/ProfileView"));
const HistoryView = React.lazy(() => import("../views/HistoryView"));
const CreateView = React.lazy(() => import("../views/CreateView"));
const GenerationView = React.lazy(() => import("../views/GenerationView"));
const TemplateView = React.lazy(() => import("../views/TemplateView"));
const UserProfileView = React.lazy(() => import("../views/UserProfileView"));
const PaymentSuccessView = React.lazy(() => import("../views/PaymentSuccessView"));
const OnboardingView = React.lazy(() => import("../views/OnboardingView"));
const SharedCreationView = React.lazy(() => import("../views/collaboration/SharedCreationView"));
const OAuthCallback = React.lazy(() => import("../pages/OAuthCallback"));
const NotFoundView = React.lazy(() => import("../views/NotFoundView"));


/**
 * Simplified application routes.
 * Reduced from 30+ to 13 essential routes.
 */
const AppRoutes = ({ handlers, state }: any) => {
    const location = useLocation();
    const { isDarkMode } = state;
    const { openCreation, openTemplate, openPayment } = handlers;

    const wrap = (component: any) => (
        <ScreenErrorBoundary>
            {component}
        </ScreenErrorBoundary>
    );

    return (
        <AnimatePresence mode="wait" initial={false}>
                <Routes location={location} key={location.pathname}>
                    {/* ===== Main 4 Tabs ===== */}
                    <Route path="/" element={
                        wrap(
                            <Suspense fallback={<div className="p-4 space-y-4"><SkeletonImageCard /><SkeletonImageCard /></div>}>
                                <PageTransition>
                                    <HomeView
                                        onOpenCreation={openCreation}
                                        onOpenTemplate={openTemplate}
                                        onOpenPayment={openPayment}
                                    />
                                </PageTransition>
                            </Suspense>
                        )
                    } />
                    <Route path="/ideas" element={
                        wrap(
                            <Suspense fallback={<div className="p-4 space-y-4"><SkeletonImageCard /><SkeletonImageCard /></div>}>
                                <PageTransition>
                                    <HomeView
                                        onOpenCreation={openCreation}
                                        onOpenTemplate={openTemplate}
                                        onOpenPayment={openPayment}
                                    />
                                </PageTransition>
                            </Suspense>
                        )
                    } />
                    <Route path="/gallery" element={
                        wrap(
                            <Suspense fallback={<SkeletonHistory />}>
                                <PageTransition>
                                    <GalleryView
                                        onRemix={(creation: any) => openCreation("image-gen", creation.prompt)}
                                        onOpenTemplate={openTemplate}
                                    />
                                </PageTransition>
                            </Suspense>
                        )
                    } />
                    <Route path="/history" element={
                        wrap(
                            <Suspense fallback={<SkeletonHistory />}>
                                <PageTransition>
                                    <HistoryView />
                                </PageTransition>
                            </Suspense>
                        )
                    } />
                    <Route path="/profile" element={
                        wrap(
                            <Suspense fallback={<ProfileSkeleton />}>
                                <PageTransition>
                                    <ProfileView isDark={isDarkMode} onOpenPayment={openPayment} />
                                </PageTransition>
                            </Suspense>
                        )
                    } />

                    {/* ===== Generation Flow ===== */}
                    <Route path="/create" element={
                        wrap(
                            <PageTransition>
                                <CreateView />
                            </PageTransition>
                        )
                    } />
                    <Route path="/generate/:type" element={
                        wrap(
                            <PageTransition>
                                <GenerationView onOpenPayment={openPayment} />
                            </PageTransition>
                        )
                    } />
                    <Route path="/template/:id" element={
                        wrap(
                            <PageTransition>
                                <TemplateView onOpenPayment={openPayment} />
                            </PageTransition>
                        )
                    } />

                    {/* ===== Supporting Pages ===== */}
                    <Route path="/user/:userId" element={
                        wrap(
                            <PageTransition>
                                <UserProfileView />
                            </PageTransition>
                        )
                    } />
                    <Route path="/c/:id" element={
                        wrap(
                            <PageTransition>
                                <SharedCreationView />
                            </PageTransition>
                        )
                    } />
                    <Route path="/onboarding" element={
                        wrap(
                            <PageTransition>
                                <OnboardingView />
                            </PageTransition>
                        )
                    } />
                    <Route path="/payment/success" element={
                        wrap(
                            <PageTransition>
                                <PaymentSuccessView />
                            </PageTransition>
                        )
                    } />
                    <Route path="/auth/callback" element={
                        wrap(
                            <PageTransition>
                                <OAuthCallback />
                            </PageTransition>
                        )
                    } />

                    {/* ===== Fallback ===== */}
                    <Route path="*" element={
                        wrap(
                            <PageTransition>
                                <NotFoundView />
                            </PageTransition>
                        )
                    } />
                </Routes>
            </AnimatePresence>
    );
};

export default AppRoutes;
