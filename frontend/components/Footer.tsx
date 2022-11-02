const Footer: React.FC = () => {
  return (
    <footer className="flex justify-center items-center">
      <div className="w-full 2xl:w-5/6 2xl:max-w-7xl flex-grow-0 px-3 my-5 pt-4 mx-2 border-t border-gray-200 md:flex md:items-center md:justify-between">
        <div className="flex items-center justify-center space-x-1 mb-0">
          <h2>
            The simple cloud database pricing sheet for AWS RDS and Google Cloud
            SQL instance
          </h2>
        </div>

        <div className="text-sm leading-8 flex flex-row flex-wrap justify-center items-center underline text-blue-700 hover:opacity-80">
          <a href="https://star-history.com" target="_blank" rel="noreferrer">
            GitHub Star History
          </a>
        </div>

        <div className="text-sm leading-8 flex flex-row flex-nowrap justify-center items-center">
          <span className="text-gray-600">
            Sponsored by
            <a
              className="ml-1 text-blue-500 font-bold hover:opacity-80"
              href="https://bytebase.com"
              target="_blank"
              rel="noreferrer"
            >
              Bytebase
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
