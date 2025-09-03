import React from 'react';
import Logo from '../components/ui/Logo';
import LoadingLogo from '../components/ui/LoadingLogo';

const LogoShowcase = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
          JerseyNexus Logo Showcase
        </h1>

        {/* Size Variations */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-gray-800">Size Variations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            <div className="text-center">
              <Logo size="xs" animated={true} showText={true} />
              <p className="mt-2 text-sm text-gray-600">Extra Small</p>
            </div>
            <div className="text-center">
              <Logo size="sm" animated={true} showText={true} />
              <p className="mt-2 text-sm text-gray-600">Small</p>
            </div>
            <div className="text-center">
              <Logo size="md" animated={true} showText={true} />
              <p className="mt-2 text-sm text-gray-600">Medium</p>
            </div>
            <div className="text-center">
              <Logo size="lg" animated={true} showText={true} />
              <p className="mt-2 text-sm text-gray-600">Large</p>
            </div>
            <div className="text-center">
              <Logo size="xl" animated={true} showText={true} />
              <p className="mt-2 text-sm text-gray-600">Extra Large</p>
            </div>
            <div className="text-center">
              <Logo size="2xl" animated={true} showText={true} />
              <p className="mt-2 text-sm text-gray-600">2X Large</p>
            </div>
          </div>
        </section>

        {/* Color Variants */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-gray-800">Color Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Logo size="xl" animated={true} showText={true} variant="default" />
              <p className="mt-4 text-sm text-gray-600">Default (Light Background)</p>
            </div>
            <div className="bg-gray-900 p-8 rounded-lg shadow-md text-center">
              <Logo size="xl" animated={true} showText={true} variant="dark" />
              <p className="mt-4 text-sm text-white">Dark Background</p>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg shadow-md text-center">
              <Logo size="xl" animated={true} showText={true} variant="white" />
              <p className="mt-4 text-sm text-white">White Variant</p>
            </div>
          </div>
        </section>

        {/* Icon Only */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-gray-800">Icon Only (No Text)</h2>
          <div className="flex justify-center space-x-8 items-center">
            <div className="text-center">
              <Logo size="sm" animated={true} showText={false} />
              <p className="mt-2 text-sm text-gray-600">Small Icon</p>
            </div>
            <div className="text-center">
              <Logo size="md" animated={true} showText={false} />
              <p className="mt-2 text-sm text-gray-600">Medium Icon</p>
            </div>
            <div className="text-center">
              <Logo size="lg" animated={true} showText={false} />
              <p className="mt-2 text-sm text-gray-600">Large Icon</p>
            </div>
            <div className="text-center">
              <Logo size="xl" animated={true} showText={false} />
              <p className="mt-2 text-sm text-gray-600">XL Icon</p>
            </div>
          </div>
        </section>

        {/* Animation States */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-gray-800">Animation States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Logo size="xl" animated={true} showText={true} />
              <p className="mt-4 text-sm text-gray-600">Animated (Hover to see effect)</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Logo size="xl" animated={false} showText={true} />
              <p className="mt-4 text-sm text-gray-600">Static (No Animation)</p>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-gray-800">Usage Examples</h2>
          
          {/* Navbar Example */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">Navbar Usage</h3>
            <div className="bg-white shadow-sm border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Logo size="lg" animated={true} showText={true} />
                <div className="flex space-x-4">
                  <span className="text-gray-600">Menu Item 1</span>
                  <span className="text-gray-600">Menu Item 2</span>
                  <span className="text-gray-600">Menu Item 3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Example */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">Footer Usage</h3>
            <div className="bg-gray-900 rounded-lg p-6">
              <Logo size="md" animated={true} showText={true} variant="dark" />
              <p className="text-gray-400 mt-2 text-sm">© 2024 JerseyNexus. All rights reserved.</p>
            </div>
          </div>

          {/* Admin Sidebar Example */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">Admin Sidebar Usage</h3>
            <div className="bg-gray-800 rounded-lg p-4 w-64">
              <div className="border-b border-gray-700 pb-4 mb-4">
                <Logo size="md" animated={true} showText={true} variant="dark" />
                <p className="text-gray-400 text-xs mt-1">Admin Panel</p>
              </div>
              <div className="space-y-2">
                <div className="text-gray-300 text-sm">Dashboard</div>
                <div className="text-gray-300 text-sm">Products</div>
                <div className="text-gray-300 text-sm">Orders</div>
              </div>
            </div>
          </div>
        </section>

        {/* Loading Example */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-gray-800">Loading Component</h2>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-12 text-center">
            <div className="inline-block">
              <LoadingLogo size="lg" message="Loading your jerseys..." />
            </div>
          </div>
        </section>

        {/* Implementation Code */}
        <section>
          <h2 className="text-2xl font-semibold mb-8 text-gray-800">Implementation</h2>
          <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`// Basic Usage
<Logo size="lg" animated={true} showText={true} variant="default" />

// Icon Only
<Logo size="md" animated={true} showText={false} />

// Dark Background
<Logo size="xl" animated={true} showText={true} variant="dark" />

// Loading Component
<LoadingLogo size="lg" message="Loading..." />`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LogoShowcase;
