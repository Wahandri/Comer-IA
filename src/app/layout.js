import './globals.css';
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import DevBadge from "../components/Credit/DevBadge";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Header />
        {/* Badge de desarrollador: fijo arriba a la derecha en toda la app */}
        <DevBadge fixedTopRight />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}