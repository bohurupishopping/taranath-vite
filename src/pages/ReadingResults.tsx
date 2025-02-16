import { useLocation, useNavigate } from 'react-router-dom';
import ReadingResults from '@/components/ReadingResults';

const ReadingResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { readingText } = location.state || { readingText: '' };

  if (!readingText) {
    navigate('/');
    return null;
  }

  return (
    <ReadingResults
      readingText={readingText}
      onBack={() => navigate('/')}
    />
  );
};

export default ReadingResultsPage; 