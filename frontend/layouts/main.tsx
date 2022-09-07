import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Props = {
  children: React.ReactNode;
  title: string;
};

const main: React.FC<Props> = ({ children, title }) => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-grow">
        <h1 className="flex flex-row justify-center mx-5 mt-4 text-4xl text-center text-slate-800 space-x-2">
          {title}
        </h1>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default main;
