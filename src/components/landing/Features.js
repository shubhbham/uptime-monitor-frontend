import {
    Activity,
    Globe,
    ShieldCheck,
    Zap,
    Bell,
    BarChart3
} from "lucide-react";

const features = [
    {
        icon: Globe,
        title: "Global Monitoring",
        description: "Check your endpoints from up to 15 different regions around the world to ensure local availability."
    },
    {
        icon: Activity,
        title: "Real-time Alerts",
        description: "Get notified instantly via Email, Slack, or SMS when your service goes down or latency spikes."
    },
    {
        icon: ShieldCheck,
        title: "SSL Health",
        description: "Automatic expiration reminders and validity checks for all your SSL certificates."
    },
    {
        icon: Zap,
        title: "Incident Management",
        description: "Create public status pages to communicate effectively with your users during outages."
    },
    {
        icon: Bell,
        title: "Custom Thresholds",
        description: "Configure sensitive latency thresholds to detect performance degradation before it hits users."
    },
    {
        icon: BarChart3,
        title: "Detailed Analytics",
        description: "Retain up to 1-year of historical performance data with p95, p99, and uptime reports."
    }
];

export default function Features() {
    return (
        <section id="features" className="relative py-24 bg-black/50 z-10">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-16 md:text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-4 sm:text-4xl">
                        Everything you need to stay online.
                    </h2>
                    <p className="text-gray-400">
                        Built for developers who care about reliability. Simple enough for side projects, powerful enough for enterprise.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={idx}
                                className="group relative rounded-2xl border border-white/5 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-white/10 hover:shadow-2xl hover:shadow-indigo-500/10"
                            >
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-110 transition-all">
                                    <Icon size={24} />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-white">{feature.title}</h3>
                                <p className="text-sm leading-relaxed text-gray-400">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
