import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Tooltip from "@/components/primitives/Tooltip";
import { useSearchConfigStore } from "@/stores";

const cloudEmoji = "☁️";
const moneyEmoji = "💸";
const providerList = ["aws", "gcp"];

const Header: React.FC = () => {
  const resetSearchConfig = useSearchConfigStore((state) => state.reset);
  const router = useRouter();
  const { provider: providerInRoute } = router.query;

  return (
    <header className="flex justify-center bg-slate-800">
      <div className="w-full 2xl:w-5/6 2xl:max-w-7xl flex justify-between items-center flex-grow-0 p-2 text-white">
        <div className="inline-flex flex-row items-center gap-4">
          <Link href="/">
            <a>
              <div
                className="relative w-32 h-8"
                onClick={() => void resetSearchConfig()}
              >
                <Image
                  src="/icons/dbcost-logo-full.webp"
                  alt="DB Cost"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </a>
          </Link>
          {providerList.map((provider: string) => (
            <Link href={`/provider/${provider}`} key={provider}>
              <a>
                <span
                  className={`${
                    providerInRoute === provider ? "border-b" : ""
                  } h-8 text-lg pt-0.5 text-white`}
                  onClick={() => void resetSearchConfig()}
                >
                  {provider.toUpperCase()}
                </span>
              </a>
            </Link>
          ))}
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
                <div
                  className="relative w-32 h-6 cursor-pointer"
                  onClick={() => {
                    window.open("https://bytebase.com?ref=dbcost", "_blank");
                  }}
                >
                  <Image
                    src="/icons/bytebase-logo-full-invert.svg"
                    alt="Bytebase"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
