import React from "react";
import { ArrowLeft, Hand, Download, Share2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Markdown from 'react-markdown';
import { cn } from "@/lib/utils";
import {
  Star as StarIcon,
  TrendingUp,
  Heart,
  Brain,
  LineChart,
  Plane,
  DollarSign,
  BookOpen,
  Compass,
  Sun,
  Calendar,
  MapPin,
  Lightbulb,
} from "lucide-react";
import remarkGfm from 'remark-gfm';
import { Options } from 'remark-gfm';
import jsPDF from 'jspdf';

interface ReadingResultsProps {
  onBack: () => void;
  readingText: string;
}

interface MarkdownProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  remarkPlugins?: ((options?: Options) => void)[];
  components?: any;
}

const NOTO_SANS_BENGALI_REGULAR = '/fonts/NotoSansBengali-Regular.ttf';
const NOTO_SANS_BENGALI_BOLD = '/fonts/NotoSansBengali-Bold.ttf';

const ReadingResults = ({ onBack, readingText }: ReadingResultsProps) => {
  const sections = parseReadingText(readingText);

  const markdownProps = {
    className: "text-gray-700 text-sm leading-relaxed overflow-hidden",
    style: {
      display: '-webkit-box',
      WebkitLineClamp: 5,
      WebkitBoxOrient: 'vertical',
    },
    remarkPlugins: [remarkGfm],
    components: {
      p: ({ node, ...props }: any) => (
        <p style={{ whiteSpace: 'pre-line' }} {...props} />
      ),
      strong: ({ node, ...props }: any) => (
        <strong style={{ color: '#6B46C1' }} {...props} />
      ),
      em: ({ node, ...props }: any) => (
        <em style={{ fontStyle: 'italic', color: '#6B46C1' }} {...props} />
      ),
    },
  };

  const handleShareAsText = () => {
    const shareText = sections.map(s => `${s.title}:\n${s.content}`).join('\n\n');
    
    if (navigator.share) {
      navigator.share({
        title: 'My Palm Reading',
        text: shareText
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Reading copied to clipboard!');
    }
  };

  const handleDownloadPDF = async () => {
    // Convert ArrayBuffer to binary string
    const arrayBufferToBinaryString = (buffer: ArrayBuffer) => {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return binary;
    };

    // Load fonts as binary strings
    const [regularFont, boldFont] = await Promise.all([
      fetch(NOTO_SANS_BENGALI_REGULAR)
        .then(res => res.arrayBuffer())
        .then(arrayBufferToBinaryString),
      fetch(NOTO_SANS_BENGALI_BOLD)
        .then(res => res.arrayBuffer())
        .then(arrayBufferToBinaryString),
    ]);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add fonts using binary strings
    doc.addFileToVFS('NotoSansBengali-Regular.ttf', regularFont);
    doc.addFileToVFS('NotoSansBengali-Bold.ttf', boldFont);
    doc.addFont('NotoSansBengali-Regular.ttf', 'NotoSansBengali', 'normal');
    doc.addFont('NotoSansBengali-Bold.ttf', 'NotoSansBengali', 'bold');

    doc.setFont('NotoSansBengali');
    doc.setFontSize(22);
    
    const margin = 15;
    let y = 20;
    const isRTL = (text: string) => 
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0980-\u09FF]/.test(text); // Arabic + Bengali

    // Set up PDF content
    doc.text('Palm Reading Report', margin, y, { align: isRTL('Palm Reading Report') ? 'right' : 'left' });
    y += 15;

    sections.forEach((section, index) => {
      // Handle RTL direction
      const align = isRTL(section.content) ? 'right' : 'left';
      const xPos = align === 'right' ? doc.internal.pageSize.width - margin : margin;

      // Title
      doc.setFontSize(16);
      doc.setFont('NotoSansBengali', 'bold');
      doc.text(`${index + 1}. ${section.title}`, xPos, y, { align });
      y += 10;

      // Content
      doc.setFontSize(12);
      doc.setFont('NotoSansBengali', 'normal');
      const lines = doc.splitTextToSize(section.content, 180);
      
      lines.forEach(line => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, xPos, y, { align });
        y += 7;
      });
      y += 10;
    });

    doc.save('palm-reading-report.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F7F7] to-[#C8CED6] py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800 shadow-md rounded-full px-4 py-2 bg-white/80 backdrop-blur-sm">
            Your Palm Reading
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleShareAsText}
              className="p-2 bg-indigo-500 hover:bg-indigo-700 text-white rounded-full shadow-md transition-colors duration-300 tooltip"
              title="Share as Text"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="p-2 bg-emerald-500 hover:bg-emerald-700 text-white rounded-full shadow-md transition-colors duration-300 tooltip"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Palm Reading Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-102">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shadow-sm">
                  <Hand className="w-5 h-5 text-indigo-600 animate-pulse" />
                </div>
                <h2 className="text-lg font-semibold text-indigo-800">Palm Reading Summary</h2>
              </div>
            </div>

            {/* Summary */}
            {sections.length > 0 && (
              <div className="px-5 py-4">
                <Markdown
                  className="text-gray-700 text-sm leading-relaxed"
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }: any) => (
                      <p style={{ whiteSpace: 'pre-line' }} {...props} />
                    ),
                    strong: ({ node, ...props }: any) => (
                      <strong style={{ color: '#6B46C1' }} {...props} />
                    ),
                    em: ({ node, ...props }: any) => (
                      <em style={{ fontStyle: 'italic', color: '#6B46C1' }} {...props} />
                    ),
                  }}
                >
                  {sections[0].content}
                </Markdown>
              </div>
            )}
          </div>

          {/* Collapsible Sections */}
          <div className="space-y-4">
            {sections.slice(1).map((section, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger asChild>
                  <button className="w-full">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                          {getSectionIcon(section.title)}
                        </div>
                        <span className="text-left font-medium text-gray-800 text-base">
                          {section.title}
                        </span>
                      </div>
                      <ChevronIcon className="w-5 h-5 text-gray-500 transition-transform duration-300" />
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-5 py-4 bg-white rounded-xl text-gray-700 text-sm leading-relaxed">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node, ...props }: any) => (
                          <p style={{ whiteSpace: 'pre-line' }} {...props} />
                        ),
                        strong: ({ node, ...props }: any) => (
                          <strong style={{ color: '#6B46C1' }} {...props} />
                        ),
                        em: ({ node, ...props }: any) => (
                          <em style={{ fontStyle: 'italic', color: '#6B46C1' }} {...props} />
                        ),
                      }}
                    >
                      {section.content}
                    </Markdown>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const parseReadingText = (readingText: string) => {
  const sections: { title: string; content: string }[] = [];
  const lines = readingText.split('\n');
  let currentTitle = '';
  let currentContent = '';

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentTitle !== '') {
        sections.push({
          title: currentTitle,
          content: currentContent
            .replace(/\*\*(.*?)\*\*/g, '**$1**')
            .replace(/\*(.*?)\*/g, '*$1*')
            .replace(/^- /gm, '* ')
            .trim()
        });
        currentContent = '';
      }
      currentTitle = line.substring(3).split('|')[0].trim();
    } else {
      currentContent += line + '\n';
    }
  }

  if (currentTitle !== '') {
    sections.push({
      title: currentTitle,
      content: currentContent
        .replace(/\*\*(.*?)\*\*/g, '**$1**')
        .replace(/\*(.*?)\*/g, '*$1*')
        .replace(/^- /gm, '* ')
        .trim()
    });
  }

  return sections;
};

const getSectionIcon = (title: string) => {
  const baseClasses = "w-5 h-5";
  switch (title.toLowerCase()) {
    case 'quick summary':
      return <TrendingUp className={`${baseClasses} text-green-500 animate-bounce`} />;
    case 'life line analysis':
      return <LineChart className={`${baseClasses} text-blue-500 animate-pulse`} />;
    case 'heart line interpretation':
      return <Heart className={`${baseClasses} text-red-500 animate-heart`} />;
    case 'head line insights':
      return <Brain className={`${baseClasses} text-purple-500 animate-brain`} />;
    case 'fate line reading':
      return <Compass className={`${baseClasses} text-gray-500 animate-fade`} />;
    case 'financial indications':
      return <DollarSign className={`${baseClasses} text-yellow-500 animate-ping`} />;
    case 'travel & foreign influences':
      return <Plane className={`${baseClasses} text-orange-500 animate-travel`} />;
    case 'fame & recognition':
      return <StarIcon className={`${baseClasses} text-amber-500 animate-star`} />;
    case 'mount analysis':
      return <Sun className={`${baseClasses} text-yellow-500`} />;
    case 'special signs & warnings':
      return <BookOpen className={`${baseClasses} text-red-500`} />;
    case 'future timeline':
      return <Calendar className={`${baseClasses} text-blue-500`} />;
    case 'behavioral patterns':
      return <Brain className={`${baseClasses} text-purple-500`} />;
    case 'practical guidance':
      return <Lightbulb className={`${baseClasses} text-yellow-500`} />;
    case 'astrological correlations':
      return <StarIcon className={`${baseClasses} text-amber-500`} />;
    default:
      return <StarIcon className={`${baseClasses} text-gray-500`} />;
  }
};

// Chevron icon component for the collapsible sections
const ChevronIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("transition-transform duration-300", className)}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ReadingResults;
