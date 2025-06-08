'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import List from './list';
import Grid from './grid';
import LiveIndicatorIcon from './icons/live-indicator-icon';
import { useEvents } from '../hooks/useEvents';

export default function Feed() {
  const [filter, setFilter] = React.useState('list');
  const [currentPage, setCurrentPage] = React.useState(0);
  const itemsPerPage = 50;

  const { data, isLoading, error, newEvents, refresh } = useEvents(currentPage, itemsPerPage);

  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setFilter('grid');
    }
  }, []);

  function handleFilterChange(layout: string) {
    if (filter !== layout) {
      setFilter(layout);
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (data?.pagination.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleRefresh = () => {
    refresh();
  };

  const events = data?.events || [];
  const pagination = data?.pagination;

  return (
    <div className="w-screen h-screen overflow-x-hidden">
      <div className="py-2 border-b-2 border-[#C1C1C1] flex items-center justify-between">
        <div className="flex items-center">
          <div className="ml-4 flex flex-row gap-2 items-center">
            <p>LIVE FEED</p>
            <LiveIndicatorIcon status={error ? 'disconnected' : 'connected'} />
            {newEvents.length > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-green-500 text-white text-xs px-2 py-1 rounded-full"
              >
                +{newEvents.length} new
              </motion.div>
            )}
          </div>
          <div className="ml-4 flex flex-row gap-1">
            <p
              className={`${filter === 'list' ? 'font-bold' : 'font-normal'} cursor-pointer`}
              onClick={() => handleFilterChange('list')}
            >
              list
            </p>
            <p>|</p>
            <p
              className={`${filter === 'grid' ? 'font-bold' : 'font-normal'} cursor-pointer`}
              onClick={() => handleFilterChange('grid')}
            >
              grid
            </p>
          </div>
        </div>
        
        <div className="mr-4 flex flex-row gap-2 items-center">
          <button
            onClick={handleRefresh}
            className="px-3 py-1 text-[#71579E] cursor-pointer hover:underline"
          >
            refresh
          </button>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0 || isLoading}
            className={`px-3 py-1 ${currentPage === 0 || isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-[#71579E] cursor-pointer hover:underline'}`}
          >
            &lt;=
          </button>
          <span className="text-sm text-gray-600">
            page {currentPage + 1} {pagination && `of ${pagination.totalPages}`}
          </span>
          <button
            onClick={handleNextPage}
            disabled={isLoading || !pagination?.hasNextPage}
            className={`px-3 py-1 ${isLoading || !pagination?.hasNextPage ? 'text-gray-400 cursor-not-allowed' : 'text-[#71579E] cursor-pointer hover:underline'}`}
          >
            =&gt;
          </button>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.p 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center relative text-black/20 text-2xl pt-[10%]"
          >
            loading...
          </motion.p>
        )}
        
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center relative text-red-500 text-xl pt-[10%]"
          >
            <p>Failed to load events</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          </motion.div>
        )}
        
        {!isLoading && !error && !events.length && (
          <motion.p 
            key="no-events"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center relative text-black/20 text-7xl pt-[10%]"
          >
            no events
          </motion.p>
        )}
        
        {!isLoading && !error && events.length > 0 && (
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filter === 'list' ? <List events={events} newEvents={newEvents} /> : <Grid events={events} newEvents={newEvents} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}