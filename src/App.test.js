import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock child components
jest.mock('./components/Navbar', () => () => <nav data-testid="navbar">Navbar</nav>);
jest.mock('./pages/Dashboard', () => () => <main>Dashboard Page</main>);
jest.mock('./pages/Login', () => () => <section>Login Page</section>);
jest.mock('./pages/Register', () => () => <section>Register Page</section>);

describe('App Component', () => {
  // Helper function to render with router
  const renderWithRouter = (route = '/') => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    );
  };

  test('renders navbar on all routes', () => {
    renderWithRouter();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  test('shows Dashboard page at root route', () => {
    renderWithRouter('/');
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  test('shows Login page at /login', () => {
    renderWithRouter('/login');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('shows Register page at /register', () => {
    renderWithRouter('/register');
    expect(screen.getByText('Register Page')).toBeInTheDocument();
  });
});