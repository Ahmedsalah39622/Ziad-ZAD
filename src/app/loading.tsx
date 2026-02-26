"use client";

import dynamic from "next/dynamic";

const PageLoader = dynamic(() => import("@/components/ui/page-loader").then(mod => mod.PageLoader), { 
    ssr: false 
});

export default function Loading() {
    return <PageLoader />;
}
