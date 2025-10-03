'use client';

import { useEffect, useState } from 'react';

interface PageComponent {
  id: string;
  type: string;
  title: string;
  icon: string;
  content: any;
  settings: any;
}

interface PreviewData {
  settings: {
    name: string;
    slug: string;
    seoTitle: string;
    status: string;
  };
  components: PageComponent[];
}

const PreviewPage = () => {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('page-preview');
    if (data) {
      setPreviewData(JSON.parse(data));
    }
  }, []);

  const renderComponent = (component: PageComponent) => {
    switch (component.type) {
      case 'hero':
        return (
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20 px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">{component.content.title}</h1>
              <p className="text-xl mb-8">{component.content.subtitle}</p>
              <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors">
                {component.content.buttonText}
              </button>
            </div>
          </div>
        );
      case 'calculator':
        return (
          <div className="py-16 px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">{component.content.title}</h2>
              <p className="text-gray-600 mb-8 text-center text-lg">{component.content.description}</p>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center text-green-600 font-medium text-lg">
                  🧮 Interactive Solar Calculator
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Electricity Bill</label>
                    <input type="number" className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="€150" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                      <option>House</option>
                      <option>Apartment</option>
                    </select>
                  </div>
                </div>
                <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium">
                  Calculate Savings
                </button>
              </div>
            </div>
          </div>
        );
      case 'testimonials':
        return (
          <div className="py-16 px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">{component.content.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {component.content.testimonials.map((testimonial: any, index: number) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center mb-4">
                      <div className="text-yellow-400 text-lg">{'★'.repeat(testimonial.rating)}</div>
                    </div>
                    <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                    <p className="font-medium text-gray-900">- {testimonial.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="py-16 px-8 bg-gray-50">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">{component.content.title}</h2>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {component.content.fields.map((field: string) => (
                    <div key={field} className={field === 'address' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input 
                        type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        placeholder={`Enter your ${field}`}
                      />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium">
                  Get Free Quote
                </button>
              </div>
            </div>
          </div>
        );
      case 'features':
        return (
          <div className="py-16 px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">{component.content.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {component.content.features.map((feature: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div className="py-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">{component.content.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {component.content.packages.map((pkg: any, index: number) => (
                  <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                    <h3 className="text-2xl font-bold mb-4">{pkg.name}</h3>
                    <div className="text-4xl font-bold text-green-600 mb-6">{pkg.price}</div>
                    <ul className="space-y-3">
                      {pkg.features.map((feature: string, fIndex: number) => (
                        <li key={fIndex} className="flex items-center gap-3">
                          <span className="text-green-600 text-lg">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium">
                      Choose Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">📄</div>
          <div className="text-lg font-medium">No preview data found</div>
          <div className="text-gray-600">Please go back to the page builder and try again</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Preview Header */}
      <div className="bg-blue-600 text-white p-4 text-center">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="text-lg font-medium">
            📱 Preview: {previewData.settings.name}
          </div>
          <button 
            onClick={() => window.close()}
            className="bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="bg-white">
        {previewData.components.map((component) => (
          <div key={component.id}>
            {renderComponent(component)}
          </div>
        ))}
        
        {previewData.components.length === 0 && (
          <div className="py-20 text-center">
            <div className="text-4xl mb-4">🎨</div>
            <div className="text-xl font-medium">Empty Page</div>
            <div className="text-gray-600">Add some components to see the preview</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPage;