import React from 'react';

const Filters: React.FC = () => {
  return (
    <div className="flex justify-start text-white ml-[5vw] mt-[5vh]">
      <div className="flex flex-col mr-3">
        <span>Sort by</span>
        <hr className="bg-white w-full mt-1" />
        <span className="pt-1">Date</span>
        <span className="pt-2">Followers</span>
      </div>
      <div className="flex flex-col">
        <span>Filter</span>
        <hr className="bg-white w-full mt-1" />
        <span className="pt-1">Casts</span>
        <span className="pt-2">Profiles</span>
      </div>
    </div>
  );
};

export default Filters;