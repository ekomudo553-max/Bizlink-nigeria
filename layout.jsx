import "./globals.css";
import Nav from "../components/Nav";

export const metadata = {
  title: "BizLink",
  description: "Discover and promote local businesses."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <footer className="footer">© {new Date().getFullYear()} BizLink</footer>
      </body>
    </html>
  );
}
