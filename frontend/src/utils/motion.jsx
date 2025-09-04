// Temporary motion wrapper to replace framer-motion
// This provides basic animations using CSS instead of framer-motion

import React from 'react';

// Remove framer-motion-like props so React doesn't warn on DOM nodes
const cleanMotionProps = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { initial, animate, transition, whileHover, whileTap, whileInView, variants, layout, exit, viewport, ...rest } = props || {};
  return rest;
};

// Simple motion div replacement
export const motion = {
  div: ({ children, className = '', initial, animate, transition, whileHover, whileInView, layout, ...props }) => {
    const cleanProps = cleanMotionProps(props);
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
      {...cleanMotionProps(props)}
    >
      {children}
    </main>
  ),

  article: ({ children, className = '', initial, animate, transition, whileHover, whileInView, layout, ...props }) => {
    const cleanProps = cleanMotionProps(props);
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
      {...cleanMotionProps(props)}
    >
      {children}
    </section>
  ),

  header: ({ children, className = '', initial, animate, transition, ...props }) => (
    <header
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...cleanMotionProps(props)}
    >
      {children}
    </header>
  ),

  footer: ({ children, className = '', initial, animate, transition, ...props }) => (
    <footer
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...cleanMotionProps(props)}
    >
      {children}
    </footer>
  ),

  form: ({ children, className = '', initial, animate, transition, ...props }) => (
    <form
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...cleanMotionProps(props)}
    >
      {children}
    </form>
  ),

  button: ({ children, className = '', initial, animate, transition, whileHover, whileTap, ...props }) => (
    <button
      className={`${className} ${whileHover?.scale ? 'hover:scale-105 transition-transform' : ''} ${whileTap ? 'active:scale-95' : ''}`}
      {...cleanMotionProps(props)}
    >
      {children}
    </button>
  ),

  nav: ({ children, className = '', initial, animate, transition, ...props }) => (
    <nav
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...cleanMotionProps(props)}
    >
      {children}
    </nav>
  ),

  ul: ({ children, className = '', initial, animate, transition, ...props }) => (
    <ul
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...cleanMotionProps(props)}
    >
      {children}
    </ul>
  ),

  li: ({ children, className = '', initial, animate, transition, ...props }) => (
    <li
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...cleanMotionProps(props)}
    >
      {children}
    </li>
  ),

  h1: ({ children, className = '', initial, animate, transition, ...props }) => (
    <h1
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...cleanMotionProps(props)}
    >
      {children}
    </h1>
  ),

  h2: ({ children, className = '', initial, animate, transition, ...props }) => (
    <h2
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...cleanMotionProps(props)}
    >
      {children}
    </h2>
  ),

  p: ({ children, className = '', initial, animate, transition, ...props }) => (
    <p
      className={`${className} ${animate?.opacity ? 'animate-fade-in' : ''}`}
      {...cleanMotionProps(props)}
    >
      {children}
    </p>
  ),

  img: ({ className = '', initial, animate, transition, whileHover, ...props }) => (
    <img
      className={`${className} ${whileHover?.scale ? 'hover:scale-105 transition-transform' : ''}`}
      {...cleanMotionProps(props)}
    />
  ),

  a: ({ children, className = '', initial, animate, transition, whileHover, ...props }) => (
    <a
      className={`${className} ${whileHover?.scale ? 'hover:scale-105 transition-transform' : ''}`}
      {...cleanMotionProps(props)}
    >
      {children}
    </a>
  ),

  span: ({ children, className = '', initial, animate, transition, whileHover, ...props }) => (
    <span
      className={`${className} ${animate?.scale ? 'animate-scale-in' : ''} ${whileHover?.scale ? 'hover:scale-105 transition-transform' : ''}`}
      {...cleanMotionProps(props)}
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