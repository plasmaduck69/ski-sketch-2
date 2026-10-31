export const metadata = { title: "Layup Lab", description: "Ski layup physics, saved builds and optimizer" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
