import React from "react";
import { Link } from "react-router-dom";

const NoSessionPage: React.FC = () => {
  return (
    <div className="text-center text-gray-800 mt-20">
      <h1 className="text-3xl font-bold mb-4 text-red-600">
        No Active Session
      </h1>
      <p className="mb-6">
        There is no active rehearsal session assigned to you at the moment.
      </p>
      <Link to="/" className="text-orange-600 hover:underline font-semibold">
        Back to Home
      </Link>
    </div>
  );
};

export default NoSessionPage;
