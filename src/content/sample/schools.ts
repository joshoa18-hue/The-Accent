/**
 * ⚠ SAMPLE DATA — Milestone 1
 * The eight schools and an initial curriculum OUTLINE (categories, courses,
 * modules). No lessons are written yet. Only src/lib/data/ may import this
 * file; in Milestone 2 the curriculum moves into the database.
 */
import type { CourseModule, School } from "@/types/school";

/** Small helper so each module fits on one readable line. */
function mod(id: string, title: string, plannedLessons: number): CourseModule {
  return { id, title, plannedLessons };
}

export const sampleSchools: School[] = [
  {
    slug: "faith-scripture-wisdom",
    name: "Faith, Scripture & Wisdom",
    shortName: "Faith & Wisdom",
    tagline: "Root your ascent in timeless truth.",
    description:
      "Study the Scriptures, the history of the faith and the practice of wisdom, building a foundation of character that every other discipline rests upon.",
    icon: "book-open",
    primaryAttribute: "wisdom",
    categories: [
      {
        id: "faith-scripture",
        title: "Scripture Study",
        description: "Read the Bible closely, in context and as a whole.",
        courses: [
          {
            id: "faith-bible-overview",
            title: "The Story of Scripture",
            summary: "A guided journey through the Bible's grand narrative, from creation to new creation.",
            level: "foundation",
            status: "open",
            modules: [
              mod("faith-bible-overview-1", "How the Bible Is Organised", 4),
              mod("faith-bible-overview-2", "Law, History and Covenant", 5),
              mod("faith-bible-overview-3", "Prophets, Gospels and Letters", 5),
            ],
          },
          {
            id: "faith-wisdom-literature",
            title: "The Wisdom Books",
            summary: "Proverbs, Ecclesiastes, Job and the Psalms as a school of practical wisdom.",
            level: "intermediate",
            status: "planned",
            modules: [
              mod("faith-wisdom-literature-1", "Proverbs: Skill for Living", 4),
              mod("faith-wisdom-literature-2", "Ecclesiastes and Job", 4),
              mod("faith-wisdom-literature-3", "Praying the Psalms", 3),
            ],
          },
        ],
      },
      {
        id: "faith-practice",
        title: "Spiritual Disciplines",
        description: "Habits that form a steady, faithful life.",
        courses: [
          {
            id: "faith-disciplines",
            title: "Foundations of Spiritual Discipline",
            summary: "Prayer, meditation on Scripture, rest and service as daily practice.",
            level: "foundation",
            status: "planned",
            modules: [
              mod("faith-disciplines-1", "Prayer and Reflection", 3),
              mod("faith-disciplines-2", "Rest and Rhythm", 3),
              mod("faith-disciplines-3", "Service and Generosity", 3),
            ],
          },
        ],
      },
      {
        id: "faith-apologetics",
        title: "Faith and Reason",
        description: "Think carefully about belief and the great questions.",
        courses: [
          {
            id: "faith-reason",
            title: "Faith and Reason",
            summary: "How thoughtful believers have engaged hard questions across history.",
            level: "advanced",
            status: "planned",
            modules: [
              mod("faith-reason-1", "What Is Knowledge?", 3),
              mod("faith-reason-2", "Classic Arguments and Objections", 4),
              mod("faith-reason-3", "Conversations with Gentleness", 3),
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "technology-computers-ai",
    name: "Technology, Computers & AI",
    shortName: "Technology & AI",
    tagline: "Understand the machines that shape the age.",
    description:
      "From how computers work to writing software and understanding artificial intelligence, learn to build with technology rather than merely use it.",
    icon: "cpu",
    primaryAttribute: "intellect",
    categories: [
      {
        id: "tech-foundations",
        title: "Computing Foundations",
        description: "What really happens inside a computer.",
        courses: [
          {
            id: "tech-how-computers-work",
            title: "How Computers Work",
            summary: "Binary, processors, memory, operating systems and networks explained from the ground up.",
            level: "foundation",
            status: "open",
            modules: [
              mod("tech-how-computers-work-1", "Bits, Bytes and Binary", 4),
              mod("tech-how-computers-work-2", "Processors and Memory", 4),
              mod("tech-how-computers-work-3", "Networks and the Internet", 5),
            ],
          },
        ],
      },
      {
        id: "tech-programming",
        title: "Programming",
        description: "Write software that solves real problems.",
        courses: [
          {
            id: "tech-web-development",
            title: "Modern Web Development",
            summary: "HTML, CSS, TypeScript and React — the tools used to build The Ascent itself.",
            level: "foundation",
            status: "open",
            modules: [
              mod("tech-web-development-1", "HTML and CSS Essentials", 5),
              mod("tech-web-development-2", "TypeScript Fundamentals", 6),
              mod("tech-web-development-3", "Building Interfaces with React", 6),
            ],
          },
          {
            id: "tech-software-engineering",
            title: "Software Engineering Practice",
            summary: "Version control, testing, architecture and working on real codebases.",
            level: "intermediate",
            status: "planned",
            modules: [
              mod("tech-software-engineering-1", "Git and Version Control", 4),
              mod("tech-software-engineering-2", "Testing Your Code", 4),
              mod("tech-software-engineering-3", "Designing Systems", 5),
            ],
          },
        ],
      },
      {
        id: "tech-ai",
        title: "Artificial Intelligence",
        description: "How modern AI works and how to use it wisely.",
        courses: [
          {
            id: "tech-ai-foundations",
            title: "Foundations of AI",
            summary: "Machine learning, language models and the ethics of intelligent systems.",
            level: "intermediate",
            status: "planned",
            modules: [
              mod("tech-ai-foundations-1", "What Is Machine Learning?", 4),
              mod("tech-ai-foundations-2", "Inside Language Models", 5),
              mod("tech-ai-foundations-3", "Using AI Responsibly", 3),
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "business-entrepreneurship-finance",
    name: "Business, Entrepreneurship & Finance",
    shortName: "Business & Finance",
    tagline: "Steward resources and build enduring ventures.",
    description:
      "Learn how businesses create value, how to start and grow a venture, and how to manage money with wisdom and discipline.",
    icon: "briefcase",
    primaryAttribute: "strategy",
    categories: [
      {
        id: "business-finance",
        title: "Personal Finance",
        description: "Master your own finances first.",
        courses: [
          {
            id: "business-personal-finance",
            title: "Personal Finance Fundamentals",
            summary: "Budgeting, saving, debt, compound interest and long-term planning.",
            level: "foundation",
            status: "open",
            modules: [
              mod("business-personal-finance-1", "Budgeting and Cash Flow", 4),
              mod("business-personal-finance-2", "Debt and Credit", 3),
              mod("business-personal-finance-3", "Saving and Compound Growth", 4),
            ],
          },
        ],
      },
      {
        id: "business-entrepreneurship",
        title: "Entrepreneurship",
        description: "Turn ideas into ventures that serve people.",
        courses: [
          {
            id: "business-startup",
            title: "From Idea to Venture",
            summary: "Finding problems worth solving, validating ideas and launching lean.",
            level: "intermediate",
            status: "planned",
            modules: [
              mod("business-startup-1", "Finding a Real Problem", 3),
              mod("business-startup-2", "Validating Before Building", 4),
              mod("business-startup-3", "Launching and Learning", 4),
            ],
          },
        ],
      },
      {
        id: "business-management",
        title: "Business Management",
        description: "Run organisations well.",
        courses: [
          {
            id: "business-accounting",
            title: "Reading the Numbers",
            summary: "Income statements, balance sheets and cash flow in plain language.",
            level: "intermediate",
            status: "planned",
            modules: [
              mod("business-accounting-1", "The Income Statement", 3),
              mod("business-accounting-2", "The Balance Sheet", 3),
              mod("business-accounting-3", "Cash Flow and Health", 3),
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "strategy-critical-thinking",
    name: "Strategy & Critical Thinking",
    shortName: "Strategy & Thinking",
    tagline: "Think clearly. Decide wisely. Act deliberately.",
    description:
      "Sharpen reasoning, recognise bias and fallacy, and learn the strategic frameworks used by leaders, generals and great thinkers.",
    icon: "brain",
    primaryAttribute: "strategy",
    categories: [
      {
        id: "strategy-logic",
        title: "Logic and Reasoning",
        description: "The tools of clear thought.",
        courses: [
          {
            id: "strategy-critical-thinking",
            title: "Critical Thinking Essentials",
            summary: "Arguments, evidence, fallacies and cognitive biases.",
            level: "foundation",
            status: "open",
            modules: [
              mod("strategy-critical-thinking-1", "Anatomy of an Argument", 4),
              mod("strategy-critical-thinking-2", "Common Fallacies", 4),
              mod("strategy-critical-thinking-3", "Biases in Our Own Minds", 4),
            ],
          },
        ],
      },
      {
        id: "strategy-decisions",
        title: "Decision-Making",
        description: "Choose well under uncertainty.",
        courses: [
          {
            id: "strategy-decisions-course",
            title: "Better Decisions",
            summary: "Mental models, probability and second-order thinking.",
            level: "intermediate",
            status: "planned",
            modules: [
              mod("strategy-decisions-course-1", "Mental Models", 4),
              mod("strategy-decisions-course-2", "Thinking in Probabilities", 3),
              mod("strategy-decisions-course-3", "Second-Order Effects", 3),
            ],
          },
        ],
      },
      {
        id: "strategy-classics",
        title: "Classic Strategy",
        description: "Lessons from history's great strategists.",
        courses: [
          {
            id: "strategy-classics-course",
            title: "The Strategic Classics",
            summary: "Enduring principles of strategy from ancient and modern thinkers.",
            level: "advanced",
            status: "planned",
            modules: [
              mod("strategy-classics-course-1", "Principles of Strategy", 3),
              mod("strategy-classics-course-2", "Strategy in Business and Life", 4),
              mod("strategy-classics-course-3", "Case Studies", 4),
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "music-creative-arts",
    name: "Music & Creative Arts",
    shortName: "Music & Arts",
    tagline: "Create beauty with skill and purpose.",
    description:
      "Develop musicianship, understand theory and composition, and explore the creative arts as disciplines of both craft and expression.",
    icon: "music",
    primaryAttribute: "creativity",
    categories: [
      {
        id: "music-theory",
        title: "Music Theory",
        description: "The language of music.",
        courses: [
          {
            id: "music-theory-foundations",
            title: "Music Theory Foundations",
            summary: "Notes, rhythm, scales, intervals and chords.",
            level: "foundation",
            status: "open",
            modules: [
              mod("music-theory-foundations-1", "Pitch and Notation", 4),
              mod("music-theory-foundations-2", "Rhythm and Metre", 4),
              mod("music-theory-foundations-3", "Scales and Chords", 5),
            ],
          },
        ],
      },
      {
        id: "music-performance",
        title: "Musicianship",
        description: "Train the ear and the hands.",
        courses: [
          {
            id: "music-ear-training",
            title: "Ear Training",
            summary: "Recognise intervals, chords and progressions by sound.",
            level: "intermediate",
            status: "planned",
            modules: [
              mod("music-ear-training-1", "Hearing Intervals", 4),
              mod("music-ear-training-2", "Hearing Chords", 4),
              mod("music-ear-training-3", "Progressions by Ear", 4),
            ],
          },
        ],
      },
      {
        id: "music-creative",
        title: "Creative Arts",
        description: "Craft and creativity beyond music.",
        courses: [
          {
            id: "music-creative-process",
            title: "The Creative Process",
            summary: "Building creative habits, finishing work and receiving critique.",
            level: "foundation",
            status: "planned",
            modules: [
              mod("music-creative-process-1", "Habits of Creators", 3),
              mod("music-creative-process-2", "From Draft to Finished", 3),
              mod("music-creative-process-3", "Feedback and Growth", 3),
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "languages-communication",
    name: "Languages & Communication",
    shortName: "Languages & Communication",
    tagline: "Speak, write and persuade with clarity.",
    description:
      "Master your own language, learn new ones and develop the speaking, writing and listening skills that open doors.",
    icon: "languages",
    primaryAttribute: "eloquence",
    categories: [
      {
        id: "languages-writing",
        title: "Writing",
        description: "Clear writing is clear thinking.",
        courses: [
          {
            id: "languages-clear-writing",
            title: "Clear and Persuasive Writing",
            summary: "Structure, style and revision for essays, emails and reports.",
            level: "foundation",
            status: "open",
            modules: [
              mod("languages-clear-writing-1", "Sentences That Work", 4),
              mod("languages-clear-writing-2", "Structuring an Argument", 4),
              mod("languages-clear-writing-3", "The Art of Revision", 3),
            ],
          },
        ],
      },
      {
        id: "languages-speaking",
        title: "Public Speaking",
        description: "Speak with confidence and purpose.",
        courses: [
          {
            id: "languages-public-speaking",
            title: "Speaking with Confidence",
            summary: "Preparing, structuring and delivering talks people remember.",
            level: "intermediate",
            status: "planned",
            modules: [
              mod("languages-public-speaking-1", "Preparing a Talk", 3),
              mod("languages-public-speaking-2", "Voice and Presence", 3),
              mod("languages-public-speaking-3", "Handling Questions", 3),
            ],
          },
        ],
      },
      {
        id: "languages-foreign",
        title: "World Languages",
        description: "Learn a new language systematically.",
        courses: [
          {
            id: "languages-learning-method",
            title: "How to Learn Any Language",
            summary: "Proven methods: spaced repetition, comprehensible input and deliberate practice.",
            level: "foundation",
            status: "planned",
            modules: [
              mod("languages-learning-method-1", "How Languages Are Acquired", 3),
              mod("languages-learning-method-2", "Vocabulary That Sticks", 3),
              mod("languages-learning-method-3", "Speaking from Day One", 3),
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "history-culture-philosophy",
    name: "History, Culture & Philosophy",
    shortName: "History & Philosophy",
    tagline: "Learn from those who climbed before you.",
    description:
      "Survey the great civilisations, ideas and turning points of history, and engage with the philosophers who shaped how we think.",
    icon: "landmark",
    primaryAttribute: "wisdom",
    categories: [
      {
        id: "history-world",
        title: "World History",
        description: "The story of civilisation.",
        courses: [
          {
            id: "history-civilisations",
            title: "Great Civilisations",
            summary: "From the ancient world to the modern age, the societies that shaped ours.",
            level: "foundation",
            status: "open",
            modules: [
              mod("history-civilisations-1", "The Ancient World", 5),
              mod("history-civilisations-2", "The Medieval World", 5),
              mod("history-civilisations-3", "The Modern World", 5),
            ],
          },
        ],
      },
      {
        id: "history-philosophy",
        title: "Philosophy",
        description: "The great questions and those who asked them.",
        courses: [
          {
            id: "history-philosophy-intro",
            title: "Introduction to Philosophy",
            summary: "Knowledge, ethics, meaning and the major schools of thought.",
            level: "intermediate",
            status: "planned",
            modules: [
              mod("history-philosophy-intro-1", "What Can We Know?", 4),
              mod("history-philosophy-intro-2", "How Should We Live?", 4),
              mod("history-philosophy-intro-3", "Great Philosophers", 5),
            ],
          },
        ],
      },
      {
        id: "history-culture",
        title: "Culture and Ideas",
        description: "Art, literature and the history of ideas.",
        courses: [
          {
            id: "history-great-books",
            title: "The Great Books",
            summary: "Reading the works that formed Western and world thought.",
            level: "advanced",
            status: "planned",
            modules: [
              mod("history-great-books-1", "How to Read a Great Book", 3),
              mod("history-great-books-2", "Ancient Classics", 4),
              mod("history-great-books-3", "Modern Classics", 4),
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "personal-development-human-skills",
    name: "Personal Development & Human Skills",
    shortName: "Personal Development",
    tagline: "Become the person your goals require.",
    description:
      "Build habits, manage time and energy, lead others and develop the emotional and relational skills that make knowledge useful.",
    icon: "sprout",
    primaryAttribute: "discipline",
    categories: [
      {
        id: "personal-habits",
        title: "Habits and Productivity",
        description: "Systems for consistent progress.",
        courses: [
          {
            id: "personal-habits-course",
            title: "Building Lasting Habits",
            summary: "The science of habit formation and practical systems for daily growth.",
            level: "foundation",
            status: "open",
            modules: [
              mod("personal-habits-course-1", "How Habits Form", 3),
              mod("personal-habits-course-2", "Designing Your Environment", 3),
              mod("personal-habits-course-3", "Time and Energy Management", 4),
            ],
          },
        ],
      },
      {
        id: "personal-relationships",
        title: "Human Skills",
        description: "Work well with and for others.",
        courses: [
          {
            id: "personal-emotional-intelligence",
            title: "Emotional Intelligence",
            summary: "Self-awareness, empathy and handling conflict well.",
            level: "intermediate",
            status: "planned",
            modules: [
              mod("personal-emotional-intelligence-1", "Knowing Yourself", 3),
              mod("personal-emotional-intelligence-2", "Understanding Others", 3),
              mod("personal-emotional-intelligence-3", "Navigating Conflict", 3),
            ],
          },
        ],
      },
      {
        id: "personal-leadership",
        title: "Leadership",
        description: "Lead yourself, then lead others.",
        courses: [
          {
            id: "personal-leadership-course",
            title: "Foundations of Leadership",
            summary: "Character, vision and serving the people you lead.",
            level: "advanced",
            status: "planned",
            modules: [
              mod("personal-leadership-course-1", "Leading Yourself", 3),
              mod("personal-leadership-course-2", "Casting Vision", 3),
              mod("personal-leadership-course-3", "Servant Leadership", 3),
            ],
          },
        ],
      },
    ],
  },
];
