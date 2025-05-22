export const info = {
  name: "Nikhil Chapre",
  brief_description:
    "I'm a mischievous full stack developer with a knack for troublemaking.",
  role: "Full Stack Developer",
  picture: "/portfolio.jpg",
  picture_alt: "Bart Simpson",
  location: "Springfield, USA",
  cv: "/resume.pdf",

  about: {
    description: `I'm a grad student at Arizona State University pursuing my Masters in Computer Science, I've interned as a full stack developer in the past and still have that passion for experimenting with different tech stacks.
    I am proficient in building web applications using MERN, Next JS and Astro.
    I also have a solid foundation in Computer Science and take deep interest in Comuter Systems Security & Cryptography.
    I also have some cool Computer Vision projects specifically Object Detection, tracking & segmentation on my github.
    I'm currently volunteering for the SEFCOM LAB @ ASU and trying to dive deep into the world of Embedded Systems.
    I also like public speaking and mentoring, you can check out my blog to get more info.
    `,
    education: [
      {
        title: "Self-Taught Developer Extraordinaire",
        date: "2000 - Present",
        location: "Springfield Elementary School of Hard Knocks",
        gpa: "4.0 (A+ in Pranks)",
        thesis: "The Art of Subverting Expectations: A Practical Guide",
      },
    ],
    experience: [
      {
        title: "Frontend Developer",
        date: "2015 - Present",
        location: "Krusty Burger Web Dev",
        description:
          "Crafted interactive web experiences using React and Redux. Often multitasked between coding and avoiding Principal Skinner.",
      },
      {
        title: "Backend Bandit",
        date: "2013 - 2015",
        location: "Comic Book Guy's Software Emporium",
        description:
          "Masterminded backend solutions using Node.js and MongoDB. Surprisingly good at debugging, considering my history of causing bugs.",
      },
      {
        title: "Junior Hacker",
        date: "2010 - 2013",
        location: "Springfield Elementary Cyber Club",
        description:
          "Pioneered early web exploits, leading the club in daring coding escapades. Was disciplined for hacking the school's grading system.",
      },
    ],

    skills: ["JavaScript", "React", "Node.js", "MongoDB", "Prank Mastery"], // not used yet
  },

  projects: [
    {
      title: "AV Speech Separation",
      date: "2022",
      description:
        "Final year undergraduate Thesis project on Audio-Visual Speech Separation using Deep Learning",
      link: "https://github.com/NikhilC2209/AVSpeech_Sep",
      tech: ["PyTorch", "Librosa"],
      img_alt: "Comic Book Club",
      img_path: "https://a-us.storyblok.com/f/1020021/1245x562/7ed27c88b4/avspeech.jpg",
    },
    {
      title: "Monocular Depth Estimation",
      date: "2025",
      description:
        "A computer vision project to explore Depth Estimation strategies from baseline to SOTA",
      link: "https://github.com/NikhilC2209/Depth_Estimation",
      tech: ["OpenCV", "PyTorch", "PIL", "Huggingface"],
      img_alt: "Skateboard Shop",
      img_path: "https://a-us.storyblok.com/f/1020021/492x369/ef9e4519b4/monodepth_proj.png",
    },
    {
      title: "Football Analytics CV",
      date: "2023",
      description:
        "CV Project involving tasks from Image annotation to Object Detection, Tracking and Team segmentation using Yolov8 on a live football match",
      link: "https://github.com/NikhilC2209/Football_Analytics_CV",
      tech: ["OpenCV", "PyTorch", "Ultralytics", "Roboflow"],
      img_alt: "Comic Book Club",
      img_path: "https://a-us.storyblok.com/f/1020021/1100x619/c49ec3520d/cv_proj.webp",
    },
    {
      title: "Next Auth v5",
      date: "2023",
      description:
        "A Sample Next.js app implementation to add Form Validation & Server side Authentication using Next-Auth v5",
      link: "https://github.com/NikhilC2209/Next-Auth-v5",
      tech: ["Next.js", "Zod", "Next-Auth v5"],
      img_alt: "Bart's Portfolio",
      img_path: "https://a-us.storyblok.com/f/1020021/1200x628/7666ae422f/next_auth_proj.png",
    },
  ],

  contact: {
    email: "bart@thesimpsons.com",
    linkedin: "https://www.linkedin.com/in/bartsimpsonfake",
    github: "https://www.github.com/gio-del",
    twitter: "https://www.twitter.com/bartsimpsonfake",
  },
};
