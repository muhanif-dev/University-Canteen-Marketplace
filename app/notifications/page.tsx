import { NotificationCenter } from "@/components/notifications/notification-center";

export default function NotificationsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-medium text-muted-foreground">Your account</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-2 text-muted-foreground">Updates about your orders and account.</p>
      </div>
      <NotificationCenter />
    </main>
  );
}
