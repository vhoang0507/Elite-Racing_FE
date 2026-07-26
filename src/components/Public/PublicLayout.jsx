import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

export function PublicHeader({ showSearch = true }) {
    return (
        <header className="sticky top-0 z-50 flex h-[76px] items-center justify-between border-b border-[var(--racing-border)] bg-[#fffaf8]/95 px-6 backdrop-blur md:px-11">
            <Link to="/" aria-label="Elite Racing League home" className="inline-flex h-full items-center no-underline">
                <img
                    src="/elite-racing-league-logo.png"
                    alt="Elite Racing League"
                    className="h-[68px] w-auto object-contain"
                />
            </Link>

            <nav className="flex items-center gap-4 text-sm font-bold text-[var(--racing-ink)]">
                {showSearch && (
                    <button
                        type="button"
                        aria-label="Search"
                        className="hidden border-0 bg-transparent text-[var(--racing-muted)] md:inline-flex"
                    >
                        <FaSearch />
                    </button>
                )}

                <Link to="/login" className="no-underline hover:text-[var(--racing-primary)]">
                    Login
                </Link>

                <Link
                    to="/register"
                    className="rounded-[6px] bg-[var(--racing-primary)] px-5 py-2.5 text-white no-underline shadow-[0_10px_20px_rgba(16,185,129,0.16)] hover:bg-[var(--racing-primary-dark)]"
                >
                    Sign Up
                </Link>
            </nav>
        </header>
    );
}

export function PublicFooter() {
    return (
        <footer className="flex flex-col gap-4 border-t border-[var(--racing-border)] bg-[#e8f7ef] px-6 py-8 md:flex-row md:items-center md:justify-between md:px-11">
            <Link to="/" aria-label="Elite Racing League home" className="inline-flex no-underline">
                <img
                    src="/elite-racing-league-logo.png"
                    alt="Elite Racing League"
                    className="h-20 w-auto object-contain"
                />
            </Link>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--racing-muted)]">
                <Link to="/" className="no-underline hover:text-[var(--racing-primary)]">Terms of Service</Link>
                <Link to="/" className="no-underline hover:text-[var(--racing-primary)]">Privacy Policy</Link>
                <Link to="/" className="no-underline hover:text-[var(--racing-primary)]">Contact Support</Link>
                <Link to="/" className="no-underline hover:text-[var(--racing-primary)]">Racing Rules</Link>
            </div>
        </footer>
    );
}

export default function PublicLayout({ children, showSearch = true }) {
    return (
        <div className="min-h-screen bg-[var(--racing-bg)] text-[var(--racing-ink)]">
            <PublicHeader showSearch={showSearch} />
            <main>{children}</main>
            <PublicFooter />
        </div>
    );
}
