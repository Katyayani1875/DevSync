import { Play, StopCircle } from 'lucide-react';

const OutputPanel = ({ output, isRunning, onClear }) => {
  return (
    <div className="w-1/3 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="bg-gray-700 p-2 flex justify-between items-center">
        <h3 className="font-medium">Output</h3>
        <div className="flex gap-2">
          {isRunning ? (
            <button className="text-red-400 hover:text-red-300">
              <StopCircle size={18} />
            </button>
          ) : (
            <button className="text-green-400 hover:text-green-300">
              <Play size={18} />
            </button>
          )}
          <button 
            onClick={onClear}
            className="text-gray-400 hover:text-gray-300"
          >
            Clear
          </button>
        </div>
      </div>
      <pre className="flex-1 p-4 overflow-auto font-mono text-sm">
        {isRunning ? 'Executing code...' : output}
      </pre>
    </div>
  );
};

export default OutputPanel;