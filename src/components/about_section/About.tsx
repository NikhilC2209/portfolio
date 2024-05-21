import React from "react";
import { info } from "../../data/info";
import Education from "./Education";
import Experience from "./Experience";

import Example from "./Example.jsx";

interface AboutProps {
  about: (typeof info)["about"];
}

export default function About(props: AboutProps) {
  const { about } = props;

  return (
    <>
    <div className="flex flex-col justify-center items-center h-full space-y-4">
      <div className="flex flex-col space-y-4 w-full lg:w-1/2 mx-4">
        <h1 className="text-4xl font-bold">About me</h1>
        <p className="text-xl font-normal leading-9">{info.about.description}</p>
      </div>

{/*      <Education education={about.education} />
      <Experience experience={about.experience} />*/}
    </div>
    <div class="w-2/3 mx-auto mt-12 space-y-8" id="temp">
        <h1 class="text-center">
          <Example text={["Website Under Construction",1000,"Check back in a few days",1000]} size="text-xl md:text-4xl" client:visible />
        </h1>
        <img class="" src="/construction.png" />
    </div>
    </>
  );
}
