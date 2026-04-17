import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[var(--brutal-cream)] py-16">
            <div className="mx-auto max-w-7xl px-6 md:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
                    <div className="space-y-4">
                        <h3 className="kiwikoo-wordmark text-xl font-black text-black">Kiwikoo</h3>
                        <p className="text-sm text-black/70 font-bold leading-relaxed max-w-xs">
                            AI-powered fashion try-on marketplace connecting influencers and brands.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-black mb-4 text-black uppercase tracking-wider text-xs">
                            Company
                        </h4>
                        <ul className="space-y-2 text-sm font-bold text-black/70">
                            <li>
                                <Link href="/about" className="hover:text-black hover:underline">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="hover:text-black hover:underline">
                                    Join Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/marketplace" className="hover:text-black hover:underline">
                                    Marketplace
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-black hover:underline">
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link href="/help" className="hover:text-black hover:underline">
                                    Help & Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black mb-4 text-black uppercase tracking-wider text-xs">
                            Features
                        </h4>
                        <ul className="space-y-2 text-sm font-bold text-black/70">
                            <li>
                                <Link href="/influencer/try-on" className="hover:text-black hover:underline">
                                    Virtual Try-On
                                </Link>
                            </li>
                            <li>
                                <Link href="/brand/ads" className="hover:text-black hover:underline">
                                    Ad Generation
                                </Link>
                            </li>
                            <li>
                                <Link href="/brand/campaigns" className="hover:text-black hover:underline">
                                    Campaigns
                                </Link>
                            </li>
                            <li>
                                <Link href="/influencer/dashboard" className="hover:text-black hover:underline">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black mb-4 text-black uppercase tracking-wider text-xs">
                            Legal
                        </h4>
                        <ul className="space-y-2 text-sm font-bold text-black/70">
                            <li>
                                <Link href="/privacy" className="hover:text-black hover:underline">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-black hover:underline">
                                    Terms of Use
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-black hover:underline">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t-[4px] border-black flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-black/60">
                    <p>&copy; 2026 Kiwikoo. All rights reserved.</p>
                    <div className="flex gap-4">
                        <span>English (US)</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
