import React from 'react';
import Avatar from 'react-avatar';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ clients, socketRef }) => {
  return (
    <div className="w-64 bg-gray-800 p-4 flex flex-col border-r border-gray-700">
      <div className="flex items-center mb-6">
        <img src="/logo.png" alt="DevSync Logo" className="h-8 mr-2" />
        <h2 className="text-2xl font-bold text-teal-400">DevSync</h2>
      </div>
      <h3 className="text-gray-400 font-semibold mb-4">Connected Users</h3>
      <div className="flex flex-col gap-3 overflow-y-auto">
        {clients.length === 0 ? (
          <p className="text-gray-500 text-sm">No other users connected</p>
        ) : (
          <AnimatePresence>
            {clients.map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <Avatar name={client.name} size="40" round="12px" />
                <span className="font-medium truncate">
                  {client.name}
                  {socketRef?.current?.id && client.id === socketRef.current.id && ' (You)'}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Sidebar;