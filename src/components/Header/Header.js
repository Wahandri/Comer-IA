'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Header.css";

export default function Header() {
  const pathname = usePathname();
  
  // Detección mejorada de rutas
  const isRecipesPage = pathname === '/';
  const isRemediesPage = pathname.startsWith('/remed-ia');

  return (
    <header className={`header ${isRecipesPage ? 'recipes-theme' : 'remedies-theme'}`}>
      <nav className="box-header">
        <ul className="urls">
          <li>
            <Link 
              href="/" 
              className={`link ${isRecipesPage ? 'active' : ''}`}
            >
              Recetas
            </Link>
          </li>
          <li>
            <Link 
              href="/remed-ia" 
              className={`link ${isRemediesPage ? 'active' : ''}`}
            >
              Remedios
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}