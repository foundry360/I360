export function Footer() {
  return (
    <footer className="py-4 px-4 md:px-6 border-t border-border/50">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Insights360. All rights reserved.</p>
      </div>
    </footer>
  );
}
