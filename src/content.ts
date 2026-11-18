// The source of truth for portfolio content. null means not ready to publish.
// Replace placeholders with real information; don't invent experience or links.
export const profile = {
	name: "Warre D'haeyer",
	firstName: "Warre",
	role: "Full Stack Developer",
	introduction:
		"Second-year Applied Technologies student at HOGENT. This is where I share my projects and what I’m learning.",
	about:
		"I’m a second-year Applied Technologies student at HOGENT. I’m using this portfolio to share my work as I build experience. More projects and details about my background will follow.",
	email: "warredhaeyer@protonmail.com" as string | null,
	github: "https://www.github.com/warredhaeyer" as string | null,
	linkedin: "https://www.linkedin.com/in/warredhaeyer/" as string | null,
	education: {
		school: "HOGENT",
		course: "Applied Technologies",
		detail: "Second year · Currently studying",
		dates: "In progress",
	},
};

export type Project = {
	id: string;
	category: string;
	title: string;
	description: string;
	tags: string[];
	status: string;
	href: string | null;
	image: { src: string; alt: string };
};

export const projects: Project[] = [
	{
		id: "01",
		category: "Design & development",
		title: "Personal portfolio",
		description:
			"The site you’re exploring. A responsive home for my work, with animated ASCII artwork and a focus on clear, accessible design.",
		tags: ["React", "TypeScript", "Tailwind CSS", "ASCII Reveal"],
		status: "You’re here",
		href: null,
		image: {
			src: "/images/portfolio-preview.jpg",
			alt: "Screenshot of this portfolio with its centered introduction and custom ASCII storm dragons",
		},
	},
	{
		id: "02",
		category: "Future project",
		title: "Project coming soon",
		description: "Reserved for a future school or personal project.",
		tags: [],
		status: "Placeholder",
		href: null,
		image: {
			src: "/images/blueprint-study.svg",
			alt: "Abstract architectural study of a blue glass cube on a drafting grid",
		},
	},
	{
		id: "03",
		category: "Future experiment",
		title: "Experiment coming soon",
		description: "Reserved for a future experiment. Details will follow.",
		tags: [],
		status: "Placeholder",
		href: null,
		image: { src: "/images/orbit-study.svg", alt: "Abstract sculptural study of luminous interlocking rings" },
	},
];

export const toolbox = [
	{
		title: "Technologies",
		description: "Languages, frameworks, and databases.",
		items: ["React", "Java", "Python", "MySQL"],
	},
	{
		title: "Tools",
		description: "Development, collaboration, and design.",
		items: ["Git", "GitHub", "Postman", "Docker", "Figma"],
	},
];
