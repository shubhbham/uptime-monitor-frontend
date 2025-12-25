import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-20 overflow-hidden">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 blur-[100px] rounded-full opacity-50" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-8 backdrop-blur-sm transition hover:bg-white/10 cursor-pointer">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-gray-300">v1.0 is now live</span>
                </div>

                {/* Headline */}
                <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-400">
                    Monitor your uptime <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        without the downtime.
                    </span>
                </h1>

                <p className="mx-auto max-w-2xl text-lg text-gray-400 mb-10 leading-relaxed">
                    Global latency monitoring, incident reporting, and SSL status checks—all in one beautiful dashboard.
                    Stop guessing if your site is down.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/monitors"
                        className="group relative flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-gray-200 hover:ring-4 hover:ring-white/20"
                    >
                        Start Monitoring Free
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                        href="/docs"
                        className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                    >
                        Read Documentation
                    </Link>
                </div>

                {/* Trust / Stats */}
                <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-gray-400" />
                        <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-gray-400" />
                        <span>14-day free trial</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-gray-400" />
                        <span>Cancel anytime</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
