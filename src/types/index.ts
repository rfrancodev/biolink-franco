export interface Profile {
  name: string;
  handle: string;
  role: string;
  bio: string;
  avatarUrl: string;
  verifiedBadge: boolean;
  footerText: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  enabled: boolean;
}

export interface LinkCard {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  isFeatured: boolean;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  order: number;
  active: boolean;
  clicksCount: number;
}

export interface BiolinkData {
  profile: Profile;
  socialLinks: SocialLink[];
  linkCards: LinkCard[];
}
