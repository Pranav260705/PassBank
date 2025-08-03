import React from "react";

const Footer = () => {
  return (
    <>
      <div className="bg-slate-800 text-white flex justify-between items-center px-25 py-3 h-17 w-full">
        <div className="logo font-bold text-white text-2xl">
          <span className="text-blue-500"> &lt;</span>
          <span>Pass</span>
          <span className="text-blue-500">Bank/&gt;</span>
        </div>
        <div className="text-centre text-lg font-bold flex gap-3 justify-between">
          <p className="pt-1">Contribute on</p>
          <button>
            <a
              href="https://github.com/Pranav260705/PassBank"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex justify-between items-center gap-1 rounded-full bg-slate-700 px-2 py-1">
                <img width={30} src="github-mark-white.png" alt="" />
                <img width={50} src="GitHub_Logo_White.png" alt="" />
              </div>
            </a>
          </button>
        </div>
      </div>
    </>
  );
};

export default Footer;
