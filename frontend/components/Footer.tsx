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

        <div className="flex flex-row flex-wrap items-center space-x-4">
        <div
          className="flex flex-row text-sm leading-8 underline text-blue-700 hover:opacity-80"
        >
          <img className="h-6 mt-1 mr-2" src="/star-history.webp" alt="star history"/>
          <a href="https://star-history.com" target="_blank">Star History</a>
        </div>
        <div
          className="flex flex-row text-sm leading-8 underline text-blue-700 hover:opacity-80"
        >
          <img className="h-6 mt-1 mr-2" src="/sqlchat.webp" alt="sql chat"/>
          <a href="https://www.sqlchat.ai" target="_blank">SQL Chat</a>
        </div>
        <div
          className="flex flex-row text-sm leading-8 underline text-blue-700 hover:opacity-80"
        >
          <img className="h-6 mt-1 mr-2" src="/mysql-vs-pg.webp" alt="mysql vs pg"/>
          <a href="https://www.mysql-vs-postgres.com/" target="_blank"
            >MySQL or PG</a
          >
        </div>
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
