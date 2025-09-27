import { Link } from 'react-router-dom';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {item.href ? (
              <Link 
                to={item.href} 
                className="hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={index === items.length - 1 ? "text-gray-900 font-medium" : "text-gray-600"}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
