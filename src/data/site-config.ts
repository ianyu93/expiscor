export type Image = {
    src: string;
    alt?: string;
    caption?: string;
};

export type Link = {
    text: string;
    href: string;
};

export type Hero = {
    title?: string;
    text?: string;
    image?: Image;
    actions?: Link[];
};

export type Subscribe = {
    title?: string;
    text?: string;
    formUrl: string;
};

export type SiteConfig = {
    website: string;
    logo?: Image;
    title: string;
    subtitle?: string;
    description: string;
    image?: Image;
    headerNavLinks?: Link[];
    footerNavLinks?: Link[];
    socialLinks?: Link[];
    hero?: Hero;
    subscribe?: Subscribe;
    postsPerPage?: number;
    projectsPerPage?: number;
};

const siteConfig: SiteConfig = {
    website: 'https://ianyu93.github.io/expiscor',
    title: 'Expiscor',
    subtitle: 'Curiosity for Life',
    description: "Ian Yu's Personal Blog",
    image: {
        src: '',
        alt: ''
    },
    headerNavLinks: [
        {
            text: 'Home',
            href: import.meta.env.BASE_URL || '/'
        },
        {
            text: 'Projects',
            href: `${import.meta.env.BASE_URL}/projects`
        },
        {
            text: 'Blog',
            href: `${import.meta.env.BASE_URL}/blog`
        },
        {
            text: 'Tags',
            href: `${import.meta.env.BASE_URL}/tags`
        }
    ],
    footerNavLinks: [
        {
            text: 'About',
            href: `${import.meta.env.BASE_URL}/about`
        },
        {
            text: 'Contact',
            href: `${import.meta.env.BASE_URL}/contact`
        },
        {
            text: 'Terms',
            href: `${import.meta.env.BASE_URL}/terms`
        },
        {
            text: 'Download theme',
            href: 'https://github.com/JustGoodUI/dante-astro-theme'
        }
    ],
    socialLinks: [
        {
            text: 'X/Twitter',
            href: 'https://x.com/ianyu93'
        },
        {
            text: 'LinkedIn',
            href: 'https://www.linkedin.com/in/ian-yu1/'
        },
        {
            text: 'Instagram',
            href: 'https://www.instagram.com/ianyu.arc/'
        }
    ],
    hero: {
        title: 'Yup! This is Where I Dump My Ideas and Stuff!',
        text: `Someone once said that writing is the only way to preserve ourselves in this age of AI. 

I'm starting this blog because I want to write about my specific experience with AI Engineering. Throughout my multiple implementations with different teams, and coming from an ML Engineer background rather than Web Development background, I've developed a set of opinions that aren't talked about enough. Many talks about AI Engineering are:
- Oriented towards web development and chatbots
- Building a system **only** for LLMs rather than a whole ML system
- Mostly about frameworks rather than engineering

Hopefully my content serves you well. I still have so much to learn, so I hope my content at least serves as an inspiration or a discussion point for your work.

Oh, I also take side gigs, so I can continue to work on interesting projects outside of my main job. If you are looking for a part-time / fractional expert, hit me up :)
`,
        // image: {
        //     src: '/hero.jpg',
        //     alt: 'Person wearing glasses and a patterned shirt holding up an orange drink while seated at a restaurant table with a plated meal'
        // },
        actions: [
            {
                text: 'Get in Touch',
                href: `${import.meta.env.BASE_URL}/contact`
            }
        ]
    },
    // subscribe: {
    //     title: 'Subscribe to Dante Newsletter',
    //     text: 'One update per week. All the latest posts directly in your inbox.',
    //     formUrl: '#'
    // },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;
