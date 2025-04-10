import './globals.css';
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}