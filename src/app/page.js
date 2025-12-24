import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div>
      <h1>Uptime monitor</h1>
      <Link
        href="/monitors"
        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        Monitors
      </Link>
    </div>
  );
};

export default page;
