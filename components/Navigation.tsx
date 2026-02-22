'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { href: '/dashboard', icon: '🏠', label: 'Inicio' },
    { href: '/chat', icon: '🤖', label: 'IA' },
    { href: '/taller', icon: '🏗️', label: 'Taller' },
    { href: '/plan', icon: '📚', label: 'Plan' },
    { href: '/proyecto', icon: '🪑', label: 'Mesa' },
    { href: '/revision', icon: '📝', label: 'Revisión' },
]

export default function Navigation() {
    const pathname = usePathname()
    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item${pathname === item.href ? ' active' : ''}`}
                >
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                </Link>
            ))}
        </nav>
    )
}
