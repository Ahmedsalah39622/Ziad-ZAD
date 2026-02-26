"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSetting } from "@/lib/actions/settings-actions";
import { XIcon, LinkedInIcon, GithubIcon, InstagramIcon, TikTokIcon, FacebookIcon } from "@/components/footer/icons";

const iconMap: Record<string, React.ElementType> = {
    instagram: InstagramIcon,
    tiktok: TikTokIcon,
    facebook: FacebookIcon,
    x: XIcon,
    linkedin: LinkedInIcon,
    github: GithubIcon,
};

const labelMap: Record<string, string> = {
    instagram: "Instagram",
    tiktok: "TikTok",
    facebook: "Facebook",
    x: "X (Twitter)",
    linkedin: "LinkedIn",
    github: "GitHub",
};

export function FooterSocials() {
    const [socialLinks, setSocialLinks] = useState<{ id: string; href: string; label: string; icon: React.ElementType }[]>([]);

    useEffect(() => {
        async function fetchLinks() {
            try {
                const socialLinksStr = await getSetting("footer_social_links", "{}");
                const socialConfig = JSON.parse(socialLinksStr);

                const activeSocialLinks = Object.entries(socialConfig)
                    .filter(([key, url]) => url && (url as string).trim() !== "" && iconMap[key])
                    .map(([key, url]) => ({
                        id: key,
                        href: url as string,
                        label: labelMap[key],
                        icon: iconMap[key],
                    }));

                setSocialLinks(activeSocialLinks);
            } catch (e) {
                console.error("Failed to parse social config", e);
            }
        }

        fetchLinks();
    }, []);

    if (socialLinks.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-4 mt-2">
            {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                    <Link
                        key={social.id}
                        href={social.href}
                        target="_blank"
                        title={social.label}
                        className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-300 hover:bg-foreground/5"
                    >
                        <IconComponent className="h-4 w-4 fill-current" />
                    </Link>
                );
            })}
        </div>
    );
}
