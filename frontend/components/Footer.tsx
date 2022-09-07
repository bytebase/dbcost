const Footer: React.FC = () => {
  return (
    <footer className="flex-grow-0 px-3 my-5 pt-4 mx-2 space-y-2 border-t border-gray-200 md:flex md:items-center md:justify-between md:space-y-0">
      <div>
        <div className="flex items-center justify-center space-x-1">
          <h2>
            The ultimate cloud database pricing sheet for AWS RDS and Google
            Cloud SQL instance
          </h2>
        </div>
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
    </footer>
  );
};

export default Footer;
