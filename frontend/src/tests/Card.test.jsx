import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

describe('Card', () => {
  it('renders with children', () => {
    render(<Card><CardContent>Content</CardContent></Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders title in header', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>My Title</CardTitle>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });
});
