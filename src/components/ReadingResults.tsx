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

  // Enhanced markdown props with better styling and list support
  const markdownProps = {
    className: "prose prose-sm max-w-none text-gray-700 leading-normal",
    remarkPlugins: [remarkGfm],
    components: {
      p: ({ node, ...props }: any) => (
        <p className="mb-2 text-gray-700 text-sm" style={{ whiteSpace: 'pre-line' }} {...props} />
      ),
      strong: ({ node, ...props }: any) => (
        <strong className="font-semibold text-indigo-700 text-sm" {...props} />
      ),
      em: ({ node, ...props }: any) => (
        <em className="italic text-indigo-600 text-sm" {...props} />
      ),
      ol: ({ node, ...props }: any) => (
        <ol className="list-decimal list-inside space-y-1 my-2 text-sm" {...props} />
      ),
      ul: ({ node, ...props }: any) => (
        <ul className="list-disc list-inside space-y-1 my-2 text-sm" {...props} />
      ),
      li: ({ node, ...props }: any) => (
        <li className="ml-2 text-sm" {...props} />
      ),
      blockquote: ({ node, ...props }: any) => (
        <blockquote className="border-l-4 border-indigo-200 pl-3 my-2 italic text-gray-600 text-sm" {...props} />
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
    <div className="min-h-screen bg-gray-50 py-2 px-2 sm:px-3">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-2 bg-white/90 p-3 rounded-lg shadow-sm border border-gray-100">
          <button
            onClick={onBack}
            className="bg-red-400 text-white p-2 rounded-lg shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800/90 text-center">
            Your Palm Reading
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleShareAsText}
              className="p-2 bg-indigo-400/90 text-white rounded-lg shadow-sm"
              title="Share as Text"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="p-2 bg-emerald-400/90 text-white rounded-lg shadow-sm"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="bg-white/90 rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-slate-200/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100/80 flex items-center justify-center shadow-md backdrop-blur-sm">
                  <Hand className="w-5 h-5 text-indigo-600/90 animate-pulse" />
                </div>
                <h2 className="text-lg font-bold text-indigo-800/90">Palm Reading Summary</h2>
              </div>
            </div>

            {/* Summary Content */}
            {sections.length > 0 && (
              <div className="p-4">
                <Markdown
                  {...{
                    ...markdownProps,
                    className: "prose prose-slate prose-sm max-w-none prose-headings:text-indigo-900/90 prose-p:text-slate-700/90"
                  }}
                >
                  {sections[0].content}
                </Markdown>
              </div>
            )}
          </div>

          {/* Collapsible Sections */}
          <div className="space-y-3">
            {sections.slice(1).map((section, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger asChild>
                  <button className="w-full group">
                    <div className="flex items-center justify-between p-3 bg-white/90 rounded-lg shadow-sm group-data-[state=open]:bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center">
                          {getSectionIcon(section.title)}
                        </div>
                        <span className="text-base font-semibold text-slate-800/90">
                          {section.title}
                        </span>
                      </div>
                      <ChevronIcon className="w-5 h-5 text-slate-500/90 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 py-3 mt-2 bg-white/90 rounded-lg shadow-sm border border-gray-100">
                    <Markdown
                      {...{
                        ...markdownProps,
                        className: "prose prose-slate prose-sm max-w-none prose-headings:text-indigo-900/90 prose-p:text-slate-700/90"
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
