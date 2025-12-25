export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black py-12 px-6 relative z-10">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
                            <span className="font-bold text-white">{process.env.NEXT_PUBLIC_SITE_NAME || "Uptime Metrics"}</span>
                        </div>
                        <p className="text-sm text-gray-500 max-w-xs">
                            Global latency monitoring and incident reporting for modern engineering teams.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Product</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-gray-300 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-gray-300 transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-gray-300 transition-colors">Changelog</a></li>
                            <li><a href="#" className="hover:text-gray-300 transition-colors">Docs</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-gray-300 transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-gray-300 transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-gray-300 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-gray-300 transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-gray-300 transition-colors">Privacy</a></li>
                            <li><a href="#" className="hover:text-gray-300 transition-colors">Terms</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-600">
                        © {new Date().getFullYear()} Uptime Monitor Inc. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        {/* Socials placeholder */}
                        <div className="h-5 w-5 bg-gray-800 rounded-md" />
                        <div className="h-5 w-5 bg-gray-800 rounded-md" />
                        <div className="h-5 w-5 bg-gray-800 rounded-md" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
