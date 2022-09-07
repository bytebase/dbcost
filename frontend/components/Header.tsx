import Image from "next/image";
import Tooltip from "@/components/primitives/Tooltip";

const cloudEmoji = "☁️";
const moneyEmoji = "💸";

const Header = () => {
  return (
    <header className="flex justify-between items-center flex-grow-0 p-2 bg-slate-800 text-white">
      <div className="inline-flex flex-row items-center gap-4">
        <div className="h-8 relative flex ">
          <Image
            src="/icons/dbcost-logo-full.webp"
            width="100%"
            height="100%"
            objectFit="contain"
            alt="DB Cost"
          />
        </div>
        <span className="h-8 text-lg pt-0.5 text-white">AWS</span>
        <span className="h-8 text-lg pt-0.5 text-white">GCP</span>
      </div>

      <div className="inline-flex flex-row items-center text-3xl">
        {`${cloudEmoji} ${moneyEmoji} ${cloudEmoji} ${moneyEmoji} ${cloudEmoji}`}
      </div>

      <div className="inline-flex float-right items-center space-x-2">
        {/* star button */}
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
          {/* Bytebase logo */}
          <div className="flex flex-row space-x-1">
            <Tooltip
              delayDuration={0}
              content="Safe Database Schema Change and Version Control for Teams"
            >
              <div className="h-8 relative flex ml-2">
                <Image
                  className="cursor-pointer"
                  width="100%"
                  height="100%"
                  objectFit="contain"
                  src="/icons/bytebase-logo-full-invert.svg"
                  alt="Bytebase"
                  onClick={() => {
                    window.open("https://bytebase.com?ref=dbcost", "_blank");
                  }}
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
