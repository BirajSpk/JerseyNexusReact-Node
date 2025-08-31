// Temporary motion wrapper to replace framer-motion
// This provides basic animations using CSS instead of framer-motion

import React from 'react';

// Simple motion div replacement
export const motion = {
  div: ({ children, className = '', initial, animate, transition, whileHover, whileInView, layout, ...props }) => {
    // Remove animation props from DOM props to avoid React warnings
    const { whileInView: _, layout: __, ...cleanProps } = props;
    return (
      <div
        className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''} ${whileHover?.scale ? 'hover:scale-105 transition-transform' : ''} ${whileInView ? 'animate-fade-in' : ''} ${layout ? 'transition-all duration-300' : ''}`}
        {...cleanProps}
      >
        {children}
      </div>
    );
  },
  
  main: ({ children, className = '', initial, animate, transition, ...props }) => (
    <main
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...props}
    >
      {children}
    </main>
  ),

  article: ({ children, className = '', initial, animate, transition, whileHover, whileInView, layout, ...props }) => {
    // Remove animation props from DOM props to avoid React warnings
    const { whileInView: _, layout: __, ...cleanProps } = props;
    return (
      <article
        className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''} ${whileHover?.scale ? 'hover:scale-105 transition-transform' : ''} ${whileInView ? 'animate-fade-in' : ''} ${layout ? 'transition-all duration-300' : ''}`}
        {...cleanProps}
      >
        {children}
      </article>
    );
  },

  section: ({ children, className = '', initial, animate, transition, ...props }) => (
    <section 
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...props}
    >
      {children}
    </section>
  ),

  header: ({ children, className = '', initial, animate, transition, ...props }) => (
    <header 
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...props}
    >
      {children}
    </header>
  ),

  footer: ({ children, className = '', initial, animate, transition, ...props }) => (
    <footer 
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...props}
    >
      {children}
    </footer>
  ),

  form: ({ children, className = '', initial, animate, transition, ...props }) => (
    <form 
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...props}
    >
      {children}
    </form>
  ),

  button: ({ children, className = '', initial, animate, transition, whileHover, whileTap, ...props }) => (
    <button 
      className={`${className} ${whileHover?.scale ? 'hover:scale-105 transition-transform' : ''}`}
      {...props}
    >
      {children}
    </button>
  ),

  nav: ({ children, className = '', initial, animate, transition, ...props }) => (
    <nav 
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...props}
    >
      {children}
    </nav>
  ),

  ul: ({ children, className = '', initial, animate, transition, ...props }) => (
    <ul 
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...props}
    >
      {children}
    </ul>
  ),

  li: ({ children, className = '', initial, animate, transition, ...props }) => (
    <li 
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...props}
    >
      {children}
    </li>
  ),

  h1: ({ children, className = '', initial, animate, transition, ...props }) => (
    <h1 
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...props}
    >
      {children}
    </h1>
  ),

  h2: ({ children, className = '', initial, animate, transition, ...props }) => (
    <h2 
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...props}
    >
      {children}
    </h2>
  ),

  p: ({ children, className = '', initial, animate, transition, ...props }) => (
    <p 
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...props}
    >
      {children}
    </p>
  ),

  img: ({ className = '', initial, animate, transition, whileHover, ...props }) => (
    <img 
      className={`${className} ${whileHover?.scale ? 'hover:scale-105 transition-transform' : ''}`}
      {...props}
    />
  ),

  a: ({ children, className = '', initial, animate, transition, whileHover, ...props }) => (
    <a
      className={`${className} ${whileHover?.scale ? 'hover:scale-105 transition-transform' : ''}`}
      {...props}
    >
      {children}
    </a>
  ),

  span: ({ children, className = '', initial, animate, transition, whileHover, ...props }) => (
    <span
      className={`${className} ${animate?.scale ? 'animate-scale-in' : ''} ${whileHover?.scale ? 'hover:scale-105 transition-transform' : ''}`}
      {...props}
    >
      {children}
    </span>
  )
};

// Simple AnimatePresence replacement
export const AnimatePresence = ({ children }) => (
  <div className="animate-fade-in">
    {children}
  </div>
);

export default motion;