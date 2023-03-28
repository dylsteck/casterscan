import React from 'react';

interface FiltersProps {
  user: string;
  sort: string;
  changeSort: (value: string) => void;
  filter: string;
  changeFilter: (value: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ user, sort, changeSort, filter, changeFilter }) => {
  return (
    <div className="flex justify-start text-white ml-[5vw] mt-[5vh]">
      <div className="flex flex-col mr-3">
        <span>Sort by</span>
        <hr className="bg-white w-full mt-1" />
        <span className={`pt-1 ${sort === 'Date' ? 'font-bold' : ''}`} onClick={() => changeSort('Date')}>Date</span>
        <span className={`pt-2 ${sort === 'Trending' ? 'font-bold' : ''}`} onClick={() => changeSort('Trending')}>Trending</span>
      </div>
      <div className="flex flex-col">
        <span>Filter</span>
        <hr className="bg-white w-full mt-1" />
        {user.length > 0 ? (
          <>
            <span className={`pt-1 ${filter === 'Casts' ? 'font-bold' : ''}`} onClick={() => changeFilter('Casts')}>Casts</span>
            <span className={`pt-2 ${filter === 'Casts + Replies' ? 'font-bold' : ''}`} onClick={() => changeFilter('Casts + Replies')}>Casts + Replies</span>
            <span className={`pt-2 ${filter === 'Likes' ? 'font-bold' : ''}`} onClick={() => changeFilter('Likes')}>Likes</span>
          </>
        ) : (
          <>
            <span className={`pt-1 ${filter === 'Casts' ? 'font-bold' : ''}`} onClick={() => changeFilter('Casts')}>Casts</span>
            <span className={`pt-2 ${filter === 'Profiles' ? 'font-bold' : ''}`} onClick={() => changeFilter('Profiles')}>Profiles</span>
          </>
        )}
      </div>
    </div>
  );
};

export default Filters;
