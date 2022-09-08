// Let's disable this rule for now. The next/image will bring some layout obtacles.
/* eslint-disable @next/next/no-img-element */
import Tooltip from "@/components/primitives/Tooltip";

const cloudEmoji = "☁️";
const moneyEmoji = "💸";

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center flex-grow-0 p-2 bg-slate-800 text-white">
      <div className="inline-flex flex-row items-center gap-4">
        <img className="h-8" src="/icons/dbcost-logo-full.webp" alt="DB Cost" />
        <span className="h-8 text-lg pt-0.5 text-white">AWS</span>
        <span className="h-8 text-lg pt-0.5 text-white">GCP</span>
      </div>

      <div className="inline-flex flex-row items-center text-3xl">
        {`${cloudEmoji} ${moneyEmoji} ${cloudEmoji} ${moneyEmoji} ${cloudEmoji}`}
      </div>

      <div className="inline-flex float-right items-center space-x-2">
        <iframe
          src="https://ghbtns.com/github-btn.html?user=bytebase&repo=dbcost&type=star"
          frameBorder="0"
          scrolling="0"
          width="50"
          height="20"
          title="GitHub"
        ></iframe>
        <div className="-mt-0.5 flex items-center">
          <span>by</span>
          <div className="flex flex-row space-x-1">
            <Tooltip
              delayDuration={0}
              content="Safe Database Schema Change and Version Control for Teams"
            >
              <img
                className="h-6 ml-2 cursor-pointer"
                src="/icons/bytebase-logo-full-invert.svg"
                alt="Bytebase"
                onClick={() => {
                  window.open("https://bytebase.com?ref=dbcost", "_blank");
                }}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
