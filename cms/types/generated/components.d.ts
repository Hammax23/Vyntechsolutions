import type { Schema, Struct } from '@strapi/strapi';

export interface HomeHeroSlide extends Struct.ComponentSchema {
  collectionName: 'components_home_hero_slides';
  info: {
    displayName: 'Hero Slide';
  };
  attributes: {
    ctaHref: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    mediaType: Schema.Attribute.Enumeration<['image', 'video']> &
      Schema.Attribute.DefaultTo<'image'>;
    mediaUrl: Schema.Attribute.String;
    subtext: Schema.Attribute.Text;
  };
}

export interface SectionsAiMlGridBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_ai_ml_grid_blocks';
  info: {
    description: 'Enterprise AI & ML capabilities grid used on the AI/ML Solutions service page';
    displayName: 'AI/ML Grid Block';
    icon: 'layer';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    intro: Schema.Attribute.JSON;
    items: Schema.Attribute.Component<'sections.ai-ml-item', true>;
  };
}

export interface SectionsAiMlItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_ai_ml_items';
  info: {
    displayName: 'AI/ML Grid Item';
    icon: 'cube';
  };
  attributes: {
    description: Schema.Attribute.Text;
    itemId: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsCanadaCitiesBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_canada_cities_blocks';
  info: {
    description: 'List of Canadian cities where the service is offered';
    displayName: 'Canada Cities Block';
    icon: 'globe';
  };
  attributes: {
    cities: Schema.Attribute.JSON;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
  };
}

export interface SectionsCityFaq extends Struct.ComponentSchema {
  collectionName: 'components_sections_city_faqs';
  info: {
    description: 'One question/answer used on city landing pages';
    displayName: 'City FAQ';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsCityHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_city_heroes';
  info: {
    description: 'All city-landing copy. Use {city}, {service}, and {description} placeholders.';
    displayName: 'City Page Copy';
    icon: 'picture';
  };
  attributes: {
    aboutBodyTemplate: Schema.Attribute.Text;
    aboutEyebrowTemplate: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'About {city}'>;
    aboutHeadingTemplate: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'{service} for {city} Businesses'>;
    advantageBody: Schema.Attribute.Text;
    advantageCtaPrimary: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Get a Free Local SEO Audit'>;
    advantageCtaSecondary: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Speak with a Strategist'>;
    advantageHeadingTemplate: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Ready to Capture the {city} Market?'>;
    advantageStats: Schema.Attribute.JSON;
    bottomCtaBodyTemplate: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Contact us today to discuss your {service} project. We provide custom quotes and transparent timelines.'>;
    bottomCtaHeadingTemplate: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Ready to Grow Your Business in {city}?'>;
    bottomCtaLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<"Let's Talk Business">;
    ctaLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Request a Free Quote'>;
    engagementHeadingTemplate: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'How Will We Increase Engagement Through {service}'>;
    eyebrowTemplate: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'{service} in {city}'>;
    faqEyebrow: Schema.Attribute.String & Schema.Attribute.DefaultTo<'FAQ'>;
    faqHeading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Frequently asked questions'>;
    faqIntroTemplate: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Everything you need to know about our {service} services in {city}.'>;
    headlineTemplate: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'{service} Services in {city}'>;
    hoursText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Mon to Fri: 9:00 AM to 6:00 PM EST'>;
    industriesHeadingTemplate: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Industries We Serve in {city}'>;
    quoteCtaTemplate: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Get a Free {city} Quote'>;
    rankingDescription: Schema.Attribute.Text;
    rankingEyebrow: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'What We Optimize'>;
    rankingHeadingTemplate: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Dominating the {city} Search Results'>;
    rankingItems: Schema.Attribute.JSON;
    sidebarHeadingTemplate: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Why {city} Businesses Choose VynTech'>;
    sidebarItems: Schema.Attribute.JSON;
    subheadingTemplate: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'{description} We are the trusted local partner for businesses in {city}.'>;
    whyChooseBodyTemplate: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Our team is dedicated to providing high-quality digital solutions tailored specifically for the {city} market. Let us help you dominate your local industry.'>;
    whyChooseHeadingTemplate: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Why Choose Us for {service} in {city}?'>;
  };
}

export interface SectionsCloudIncludedBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_cloud_included_blocks';
  info: {
    description: 'Enterprise cloud deliverables block used on the Cloud Solutions service page';
    displayName: 'Cloud Included Block';
    icon: 'server';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Enterprise Cloud Deliverables'>;
    items: Schema.Attribute.Component<'sections.cloud-included-item', true>;
  };
}

export interface SectionsCloudIncludedItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_cloud_included_items';
  info: {
    displayName: 'Cloud Included Item';
    icon: 'cloud';
  };
  attributes: {
    description: Schema.Attribute.Text;
    itemId: Schema.Attribute.String;
    points: Schema.Attribute.JSON;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsDeliveryStep extends Struct.ComponentSchema {
  collectionName: 'components_sections_delivery_steps';
  info: {
    displayName: 'Delivery Step';
    icon: 'list';
  };
  attributes: {
    content: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SectionsDevopsGridBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_devops_grid_blocks';
  info: {
    description: 'Comprehensive DevOps services grid used on the DevOps & CI/CD service page';
    displayName: 'DevOps Grid Block';
    icon: 'gear';
  };
  attributes: {
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'sections.numbered-item', true>;
  };
}

export interface SectionsEcommerceServicesBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_ecommerce_services_blocks';
  info: {
    description: 'End-to-end ecommerce services grid used on the Ecommerce Solutions service page';
    displayName: 'Ecommerce Services Block';
    icon: 'shopping-cart';
  };
  attributes: {
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'sections.numbered-item', true>;
  };
}

export interface SectionsEngagementStrategy extends Struct.ComponentSchema {
  collectionName: 'components_sections_engagement_strategies';
  info: {
    description: 'One strategy card used on city landing pages';
    displayName: 'Engagement Strategy';
    icon: 'compass';
  };
  attributes: {
    calloutText: Schema.Attribute.Text;
    calloutTitle: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    strategyId: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsLocalSeoBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_local_seo_blocks';
  info: {
    description: 'Why Our Local SEO Works section on the SEO Digital Marketing service page';
    displayName: 'Local SEO Block';
    icon: 'search';
  };
  attributes: {
    cities: Schema.Attribute.JSON;
    citiesDescription: Schema.Attribute.Text;
    citiesHeading: Schema.Attribute.String;
    ctaBody: Schema.Attribute.Text;
    ctaHeading: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Request a Free Quote'>;
    specialistsEyebrow: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Local SEO Specialists'>;
    stats: Schema.Attribute.Component<'shared.stat', true>;
    whyHeading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Why Our Local SEO Works'>;
    whyParagraphs: Schema.Attribute.JSON;
  };
}

export interface SectionsMobileTab extends Struct.ComponentSchema {
  collectionName: 'components_sections_mobile_tabs';
  info: {
    description: 'One tab in the mobile app development What We Offer section';
    displayName: 'Mobile Tab';
    icon: 'mobile';
  };
  attributes: {
    description: Schema.Attribute.Text;
    highlightText: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    points: Schema.Attribute.Component<'sections.mobile-tab-point', true>;
    tabId: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsMobileTabPoint extends Struct.ComponentSchema {
  collectionName: 'components_sections_mobile_tab_points';
  info: {
    displayName: 'Mobile Tab Point';
    icon: 'bulletList';
  };
  attributes: {
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsMobileTabsBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_mobile_tabs_blocks';
  info: {
    description: 'What We Offer tabbed section used on the Mobile App Development service page';
    displayName: 'Mobile Tabs Block';
    icon: 'tabs';
  };
  attributes: {
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    tabs: Schema.Attribute.Component<'sections.mobile-tab', true>;
  };
}

export interface SectionsNumberedItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_numbered_items';
  info: {
    description: 'Item with 01/02/03 number label used in DevOps and Ecommerce service grids';
    displayName: 'Numbered Grid Item';
    icon: 'hashtag';
  };
  attributes: {
    desc: Schema.Attribute.Text;
    num: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsSeoPackage extends Struct.ComponentSchema {
  collectionName: 'components_sections_seo_packages';
  info: {
    description: 'One pricing tier inside the SEO packages block';
    displayName: 'SEO Package';
    icon: 'cash';
  };
  attributes: {
    blurb: Schema.Attribute.Text;
    ctaLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Get Started'>;
    featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    featuredBadge: Schema.Attribute.String;
    features: Schema.Attribute.JSON;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.String & Schema.Attribute.Required;
    priceSuffix: Schema.Attribute.String;
  };
}

export interface SectionsSeoPackagesBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_seo_packages_blocks';
  info: {
    description: 'Pricing table block used on the SEO Digital Marketing service page';
    displayName: 'SEO Packages Block';
    icon: 'grid';
  };
  attributes: {
    customPackageCtaLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Contact us'>;
    customPackageText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Need a custom package?'>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'SEO Packages'>;
    footerNote: Schema.Attribute.Text;
    heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Choose Your Growth Plan'>;
    packages: Schema.Attribute.Component<'sections.seo-package', true>;
  };
}

export interface SectionsTechStackBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_tech_stack_blocks';
  info: {
    description: 'Categorized technology stack tabs used across service pages';
    displayName: 'Tech Stack Block';
    icon: 'layer-group';
  };
  attributes: {
    categories: Schema.Attribute.Component<
      'sections.tech-stack-category',
      true
    >;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Technology Stack'>;
  };
}

export interface SectionsTechStackCategory extends Struct.ComponentSchema {
  collectionName: 'components_sections_tech_stack_categories';
  info: {
    displayName: 'Tech Stack Category';
    icon: 'folder';
  };
  attributes: {
    categoryId: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'sections.tech-stack-item', true>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsTechStackItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_tech_stack_items';
  info: {
    displayName: 'Tech Stack Item';
    icon: 'brush';
  };
  attributes: {
    logo: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsUiuxEngagement extends Struct.ComponentSchema {
  collectionName: 'components_sections_uiux_engagements';
  info: {
    displayName: 'UI/UX Engagement Item';
    icon: 'paint-brush';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsUiuxEngagementsBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_uiux_engagements_blocks';
  info: {
    description: 'Types of UI/UX engagements block used on the UI/UX Design service page';
    displayName: 'UI/UX Engagements Block';
    icon: 'layout';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'sections.uiux-engagement', true>;
  };
}

export interface SectionsValueCard extends Struct.ComponentSchema {
  collectionName: 'components_sections_value_cards';
  info: {
    displayName: 'Value Card';
    icon: 'star';
  };
  attributes: {
    icon: Schema.Attribute.String & Schema.Attribute.DefaultTo<'chart'>;
    label: Schema.Attribute.String;
  };
}

export interface SharedCaseStudy extends Struct.ComponentSchema {
  collectionName: 'components_shared_case_studies';
  info: {
    displayName: 'Case Study';
  };
  attributes: {
    industry: Schema.Attribute.String;
    result: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedFaq extends Struct.ComponentSchema {
  collectionName: 'components_shared_faqs';
  info: {
    description: '';
    displayName: 'FAQ';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLinkGroup extends Struct.ComponentSchema {
  collectionName: 'components_shared_link_groups';
  info: {
    displayName: 'Link Group';
  };
  attributes: {
    links: Schema.Attribute.Component<'shared.nav-link', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedNamedItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_named_items';
  info: {
    displayName: 'Named Item';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedNavLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_links';
  info: {
    displayName: 'Nav Link';
  };
  attributes: {
    highlight: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface SharedOpenGraph extends Struct.ComponentSchema {
  collectionName: 'components_shared_open_graphs';
  info: {
    description: 'Social share preview (Facebook / LinkedIn / X)';
    displayName: 'Open Graph';
    icon: 'project-diagram';
  };
  attributes: {
    ogDescription: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    ogType: Schema.Attribute.String;
    ogUrl: Schema.Attribute.String;
  };
}

export interface SharedProcessStep extends Struct.ComponentSchema {
  collectionName: 'components_shared_process_steps';
  info: {
    displayName: 'Process Step';
  };
  attributes: {
    description: Schema.Attribute.Text;
    step: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Page SEO metadata with SERP & social preview support';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonical: Schema.Attribute.String;
    canonicalURL: Schema.Attribute.String;
    focusKeyword: Schema.Attribute.String;
    indexable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaRobots: Schema.Attribute.String;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaViewport: Schema.Attribute.String;
    ogImage: Schema.Attribute.Media<'images'>;
    openGraph: Schema.Attribute.Component<'shared.open-graph', false>;
    structuredData: Schema.Attribute.JSON;
  };
}

export interface SharedStat extends Struct.ComponentSchema {
  collectionName: 'components_shared_stats';
  info: {
    displayName: 'Stat';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'home.hero-slide': HomeHeroSlide;
      'sections.ai-ml-grid-block': SectionsAiMlGridBlock;
      'sections.ai-ml-item': SectionsAiMlItem;
      'sections.canada-cities-block': SectionsCanadaCitiesBlock;
      'sections.city-faq': SectionsCityFaq;
      'sections.city-hero': SectionsCityHero;
      'sections.cloud-included-block': SectionsCloudIncludedBlock;
      'sections.cloud-included-item': SectionsCloudIncludedItem;
      'sections.delivery-step': SectionsDeliveryStep;
      'sections.devops-grid-block': SectionsDevopsGridBlock;
      'sections.ecommerce-services-block': SectionsEcommerceServicesBlock;
      'sections.engagement-strategy': SectionsEngagementStrategy;
      'sections.local-seo-block': SectionsLocalSeoBlock;
      'sections.mobile-tab': SectionsMobileTab;
      'sections.mobile-tab-point': SectionsMobileTabPoint;
      'sections.mobile-tabs-block': SectionsMobileTabsBlock;
      'sections.numbered-item': SectionsNumberedItem;
      'sections.seo-package': SectionsSeoPackage;
      'sections.seo-packages-block': SectionsSeoPackagesBlock;
      'sections.tech-stack-block': SectionsTechStackBlock;
      'sections.tech-stack-category': SectionsTechStackCategory;
      'sections.tech-stack-item': SectionsTechStackItem;
      'sections.uiux-engagement': SectionsUiuxEngagement;
      'sections.uiux-engagements-block': SectionsUiuxEngagementsBlock;
      'sections.value-card': SectionsValueCard;
      'shared.case-study': SharedCaseStudy;
      'shared.faq': SharedFaq;
      'shared.link-group': SharedLinkGroup;
      'shared.named-item': SharedNamedItem;
      'shared.nav-link': SharedNavLink;
      'shared.open-graph': SharedOpenGraph;
      'shared.process-step': SharedProcessStep;
      'shared.seo': SharedSeo;
      'shared.stat': SharedStat;
    }
  }
}
