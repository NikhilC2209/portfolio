import { useEffect, useState } from "react";
import ToggleDarkMode from "../ToggleDarkMode";
import Search from "../search/Search";
import Hamburger from "./Hamburger";
import { info } from "../../data/info";

export default function Nav({ posts }) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const navLinks = [
    { name: "About", href: "/#about" },
    { name: "Projects", href: "/#projects" },
    { name: "Blog", href: "/blog" },
    { name: "Thoughts", href: "/thoughts" },
  ];

  const extractInitials = (name) => {
    const names = name.split(" ");
    let initials = "";
    names.forEach((name) => {
      initials += name.charAt(0);
    });
    return initials;
  };

  return (
    <>
      {/* <nav className="container mx-auto top-0 z-50 absolute bg-primary dark:bg-dk-primary"> */}
      <nav className="w-screen mx-auto top-0 z-50 sticky bg-primary dark:bg-dk-primary">
        <div className="w-full px-6 py-2 flex justify-between items-center">
          <a className="font-bold text-2xl lg:text-4xl" href="/#">
            <h1 className="text-secondary text-2xl md:text-4xl m-0 dark:text-dk-secondary">
              {/* {"</" + extractInitials(info.name) + ">"} */}
              {"<" + "Portfolio" + " />"}
            </h1>
          </a>

          {/* Button for CV download */}
          {/* <a */}
          {/*   href={info.cv} */}
          {/*   download */}
          {/*   className="px-4 py-2 border-2 rounded text-secondary dark:text-dk-secondary border-secondary dark:border-dk-secondary hover:bg-secondary dark:hover:bg-dk-secondary hover:text-primary dark:hover:text-primary cursor-pointer" */}
          {/* > */}
          {/*   <i className="fas fa-download mr-2"></i> */}
          {/*   <h1 className="hidden lg:inline-block font-medium"> */}
          {/*     Download CV */}
          {/*   </h1> */}
          {/*   <span className="lg:hidden font-medium">CV</span> */}
          {/* </a> */}

          <div className="inline-flex lg:hidden text-secondary dark:text-dk-secondary">
            <Hamburger
              onClick={() => setIsNavOpen(!isNavOpen)}
              isNavOpen={isNavOpen}
            />
          </div>
          <div className="hidden lg:block">
            <ul className="inline-flex text-secondary dark:text-dk-secondary text-2xl font-normal">
              {navLinks.map((link, index) => (
                <li
                  key={index}
                  className="p-4 hover:text-accent dark:hover:text-dk-accent"
                >
                  <a href={link.href}><h1 class="text-2xl m-0">{link.name}</h1></a>
                </li>
              ))}
              <li className="px-4 flex">
                <ToggleDarkMode />
              </li>
              <li className="px-4 flex">
                <Search posts={posts} />
              </li>
            </ul>
          </div>
        </div>
        <div
          className={
            !isNavOpen
              ? "hidden"
              : "" +
                " h-full flex flex-col items-center text-center lg:hidden dark:text-tertiary"
          }
        >
          <ul className="w-full text-secondary dark:text-dk-secondary text-xl font-semibold">
            {navLinks.map((link, index) => (
              <li key={index} className="p-4">
                <a href={link.href} onClick={() => setIsNavOpen(false)}>
                  <h1>{link.name}</h1>
                </a>
              </li>
            ))}
            <li className="p-4 flex flex-row items-center justify-evenly">
              <ToggleDarkMode />
              <Search posts={posts} />
            </li>
          </ul>
        </div>
      </nav>
      {isNavOpen && (
        <div
          className="fixed inset-0 blur-3xl bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsNavOpen(false)}
        ></div>
      )}
    </>
  );
}
