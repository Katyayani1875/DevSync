import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const ringRef = useRef(null);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <>
      <div 
        ref={ringRef}
        className="cursor-ring w-8 h-8 -mt-4 -ml-4 border-2 border-accent rounded-full transition-transform duration-200 ease-out"
      />
    </>
  );
};

export default CustomCursor;