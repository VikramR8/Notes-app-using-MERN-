import React from "react";
import { useNavigate } from "react-router-dom";
import Notes from "../assets/images/Notes.svg"
import Navbar from "../components/Navbar/Navbar";

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="h-screen bg-white flex flex-col justify-between">
      <header> 
        <Navbar/>
      </header>

      {/* Main Content */}
      <div className="flex justify-between items-center px-20">
        {/* Text Section */}
        <div className="flex flex-col space-y-6 max-w-md">
          <h1 className="text-5xl font-bold text-slate-900">
            Forget about your messy Notes.
          </h1>
          <p className="text-md text-slate-500">
            NotePad is an open-source notes app developed for the ease of users.
          </p>
          <button
            className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full mt-4 transition-all"
            onClick={handleGetStarted}
          >
            Get Started
          </button>
        </div>
        <div className="max-w-xl">
          <img
            src={Notes}
            alt="Illustration"
            className="w-full h-auto"
          />
        </div>
      </div>
      <footer className="text-center py-4 text-slate-400 text-sm">
      </footer>
    </div>
  );
};

export default WelcomePage;
