import React from "react";
import { info } from "../../data/info";
import Education from "./Education";
import Experience from "./Experience";

import Example from "./Example.jsx";

interface AboutProps {
  about: (typeof info)["about"];
}

// Renders the two bits of markup the description uses: **bold** and [text](href).
// Bold takes the heading colour, like <b> does in blog posts (src/styles/blog.css).
const inlineMarkup = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;

function renderInline(text: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(inlineMarkup)) {
    const [raw, bold, label, href] = match;
    parts.push(text.slice(last, match.index));
    parts.push(
      bold !== undefined ? (
        <b key={match.index} className="font-semibold text-secondary dark:text-dk-secondary">{bold}</b>
      ) : (
        <a key={match.index} href={href} className="text-secondary dark:text-dk-secondary underline underline-offset-4 hover:text-accent dark:hover:text-dk-accent">{label}</a>
      )
    );
    last = match.index + raw.length;
  }
  parts.push(text.slice(last));
  return parts;
}

export default function About(props: AboutProps) {
  const { about } = props;

  return (
    <>
    <div className="flex flex-col justify-center items-center h-full space-y-4">
      <div className="flex flex-col space-y-5 w-full lg:w-2/3 mx-4">
        <h1 className="font-display text-4xl font-bold" data-hud="/// ABOUT.ME">About me</h1>
        {about.description.map((paragraph, i) => (
          <p key={i} className="text-lg font-normal leading-8">{renderInline(paragraph)}</p>
        ))}
      </div>

{/*      <Education education={about.education} />
      <Experience experience={about.experience} />*/}
    </div>
    {/*<div class="w-2/3 mx-auto mt-12 space-y-8" id="temp">
        <h1 class="text-center">
          <Example text={["Website Under Construction",1000,"Check back in a few days",1000]} size="text-xl md:text-4xl" client:visible />
        </h1>
        <img class="" src="/construction.png" />
    </div> */}
    </>
  );
}
