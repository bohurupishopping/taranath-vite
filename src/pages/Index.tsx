import React, { useState, useCallback, useRef } from "react";
import { Camera, Star, MessageSquare, User, HelpCircle, Download } from "lucide-react";
import { toast } from "sonner";
import ReadingResults from "@/components/ReadingResults";
import { getPalmReading } from '@/api/apiService'; // Import the API service
import LoadingOverlay from '@/components/LoadingOverlay'; // Import the LoadingOverlay component
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    birthYear: "",
    palmImage: null as File | null,
    rashi: "",
    language: "",
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Create a reference to the input element
  const [isLoading, setIsLoading] = useState(false); // Add a loading state
  const [showSeoCard, setShowSeoCard] = useState(false);
  const [showDownloadSection, setShowDownloadSection] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setFormData({ ...formData, palmImage: file });
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.palmImage) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const apiFormData = new FormData();
      apiFormData.append('fullName', formData.fullName);
      if (formData.birthYear) {
        apiFormData.append('birthYear', formData.birthYear);
      }
      apiFormData.append('rashi', formData.rashi);
      apiFormData.append('language', formData.language);
      if (formData.palmImage) {
        apiFormData.append('palmImage', formData.palmImage);
      }

      const reading = await getPalmReading(apiFormData);
      navigate('/reading-results', { state: { readingText: reading } });
      toast.success("Reading generated successfully!");
    } catch (error: any) {
      toast.error(`Failed to generate reading: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to trigger the file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleSeoCard = () => {
    setShowSeoCard(!showSeoCard);
  };

  const toggleDownloadSection = () => {
    setShowDownloadSection(!showDownloadSection);
  };

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      <div 
        className="min-h-screen py-4 px-3 sm:py-8 sm:px-6 lg:py-12"
        style={{ 
          background: 'linear-gradient(to bottom, #C8CED6, #D4CAC5)',
          backgroundAttachment: 'fixed' 
        }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-4 sm:mb-8 animate-fade-in relative">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <div className="h-1 w-8 bg-mystic-400 rounded-full" />
              <button 
                onClick={toggleDownloadSection}
                className="p-2 text-mystic-500 hover:text-mystic-700 transition-colors duration-200"
                title="Download App"
              >
                <Download className="w-5 h-5 stroke-2" />
              </button>
              <h1 className="text-3xl font-bold text-mystic-800 tracking-tight">
                Taranath Tantrik
              </h1>
              <button 
                onClick={toggleSeoCard}
                className="p-2 text-mystic-500 hover:text-mystic-700 transition-colors duration-200"
                title="About"
              >
                <HelpCircle className="w-5 h-5 stroke-2" />
              </button>
              <div className="h-1 w-8 bg-mystic-400 rounded-full" />
            </div>
            <div className="inline-block px-4 py-1 bg-mystic-400/20 rounded-full border border-mystic-300/30">
              <h2 className="text-sm font-medium text-mystic-700 tracking-wide">
                Vedic Palm Analysis System
              </h2>
            </div>
            <div className="absolute top-0 right-0">
             
            </div>
          </div>

          {showSeoCard && (
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg border border-mystic-200/50 animate-fade-in">
              <h3 className="font-semibold text-lg text-mystic-800 mb-2">About Taranath Tantrik</h3>
              <p className="text-sm text-mystic-700">
                Experience the captivating blend of ancient palmistry wisdom and modern technology with our unique application. Leveraged by advanced AI, this tool meticulously analyzes your palm images to provide personalized insights, drawing from the extensive knowledge of the legendary palmist William John Warner (Cheiro) and other esteemed experts in the field.
              </p>
              <p className="text-sm text-mystic-700 mt-2">
                Dive into the ancient art of Vedic palmistry, where the lines and symbols on your palms reveal profound insights into your life's path. At Bohurupi Shopping & Eso Golpo Kori, we offer personalized Vedic palm readings, guiding you towards self-discovery and informed decision-making.
              </p>
              <p className="text-sm text-mystic-700 mt-2">
                <b>Who is Taranath Tantrik?</b>
              </p>
              <p className="text-sm text-mystic-700">
                Taranath Tantrik is a fictional character created by renowned Bengali author Bibhutibhushan Bandyopadhyay. Portrayed as a mystic and practitioner of the occult, while Taranath himself is a literary figure, our app brings his wisdom to life by collaborating with esteemed palmists, including the legendary Cheiro.
              </p>
              <p className="text-sm text-mystic-700 mt-2">
                <b>Meet Cheiro</b>
              </p>
              <p className="text-sm text-mystic-700">
                William John Warner, popularly known as Cheiro, was a distinguished Irish astrologer and palmist of the early 20th century. Celebrated for his accurate readings, Cheiro's clientele included notable figures like Mark Twain and Oscar Wilde. His expertise has been instrumental in popularizing palmistry worldwide.
              </p>
              <p className="text-sm text-mystic-700 mt-2">
                <b>Why Choose Our Vedic Palm Reading Services?</b>
              </p>
              <ul className="list-disc list-inside text-sm text-mystic-700">
                <li>Free Vedic Palm Reading: Discover the secrets etched in your palms.</li>
                <li>Personalized Insights: Tailored interpretations for your unique life journey.</li>
                <li>Guidance for Self-Discovery: Navigate your life with confidence through our detailed readings.</li>
                <li>Expert Knowledge: Access insights from the teachings of Cheiro and other renowned palmists.</li>
                <li>Cutting-Edge Technology: Get accurate readings with the help of AI-powered analysis.</li>
                <li>Comprehensive Guidance: Make informed decisions with insights into your personality, career, relationships, and more.</li>
              </ul>
              <p className="text-sm text-mystic-700 mt-2">
                Begin your journey of self-discovery today with our free Vedic palmistry service. Understand your past, navigate your present, and shape your future with the wisdom of your palms.
              </p>
              <p className="text-sm text-mystic-700 mt-2">
                Visit Bohurupi Shopping & Eso Golpo Kori to start exploring your destiny now!
              </p>
              <p className="text-sm text-mystic-700">
                Book Your Free Reading Today
              </p>
              
            </div>
          )}

          {showDownloadSection && (
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg border border-mystic-200/50 animate-fade-in">
              <h3 className="font-semibold text-lg text-mystic-800 mb-2">Download Mobile App</h3>
              <p className="text-sm text-mystic-700 mb-4">
                Get the full Taranath Tantrik experience on your mobile device. 
                Enjoy additional features and personalized notifications.
              </p>
              <button
                onClick={() => window.open('https://taranathtantrik.bohurupi.com/apk', '_blank')}
                className="w-full py-2 px-4 bg-mystic-600 hover:bg-mystic-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download APK (Android)
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Form Content */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-mystic-200/50">
                <h3 className="section-title text-mystic-800 mb-4">
                  <User className="w-5 h-5 text-mystic-600 stroke-2" />
                  <span className="ml-2">Personal Information</span>
                </h3>
                
                {/* Name and Birth Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Full Name Input */}
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-mystic-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input w-full px-3 py-1.5 text-sm sm:px-4 sm:py-2.5 sm:text-base rounded-lg border-mystic-300 focus:ring-2 focus:ring-mystic-400 focus:border-mystic-400"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Birth Year Input */}
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-mystic-700">
                      Year of Birth (Optional)
                    </label>
                    <input
                      type="number"
                      className="form-input w-full px-3 py-1.5 text-sm sm:px-4 sm:py-2.5 sm:text-base rounded-lg border-mystic-300 focus:ring-2 focus:ring-mystic-400 focus:border-mystic-400"
                      value={formData.birthYear}
                      onChange={(e) =>
                        setFormData({ ...formData, birthYear: e.target.value })
                      }
                      placeholder="Enter birth year"
                      min={1900}
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                {/* Palm Image Upload */}
                <div className="mt-6 space-y-1">
                  <label className="block text-sm font-medium text-mystic-700">
                    Palm Image <span className="text-rose-500">*</span>
                  </label>
                  <div 
                    className={`upload-area group relative h-40 sm:h-48 rounded-xl border-2 border-dashed ${
                      isDragging 
                        ? 'border-mystic-400 bg-mystic-100/50' 
                        : 'border-mystic-300 hover:border-mystic-400 bg-mystic-50/70'
                    } transition-colors duration-200 cursor-pointer`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      ref={fileInputRef}
                    />
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Palm preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="upload-content absolute inset-0 flex flex-col items-center justify-center space-y-2 text-mystic-500 group-hover:text-mystic-600">
                        <Camera className="w-8 h-8" strokeWidth={1.5} />
                        <p className="text-sm font-medium">Upload palm photo</p>
                        <p className="text-xs text-mystic-400">JPEG, PNG (max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-mystic-200/50">
                <h3 className="section-title text-mystic-800 mb-4">
                  <Star className="w-5 h-5 text-mystic-600 stroke-2" />
                  <span className="ml-2">Reading Preferences</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rashi Select */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-mystic-700">
                      Zodiac Sign (Optional)
                    </label>
                    <div className="relative">
                      <select
                        className="select-input w-full px-3 py-1.5 text-sm sm:px-4 sm:py-2.5 sm:text-base rounded-lg border-mystic-300 focus:ring-2 focus:ring-mystic-400 appearance-none bg-no-repeat bg-[length:20px_20px] bg-[right_12px_center]"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3e%3cpath d='M15.3 9.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4l3.3 3.29 3.3-3.3z'/%3e%3c/svg%3e")` }}
                        value={formData.rashi}
                        onChange={(e) =>
                          setFormData({ ...formData, rashi: e.target.value })
                        }
                      >
                        <option value="">Select Rashi</option>
                        <option value="aries">Aries (Mesh)</option>
                        <option value="taurus">Taurus (Vrishabh)</option>
                        <option value="gemini">Gemini (Mithun)</option>
                        <option value="cancer">Cancer (Kark)</option>
                        <option value="leo">Leo (Singh)</option>
                        <option value="virgo">Virgo (Kanya)</option>
                        <option value="libra">Libra (Tula)</option>
                        <option value="scorpio">Scorpio (Vrishchik)</option>
                        <option value="sagittarius">Sagittarius (Dhanu)</option>
                        <option value="capricorn">Capricorn (Makar)</option>
                        <option value="aquarius">Aquarius (Kumbh)</option>
                        <option value="pisces">Pisces (Meen)</option>
                      </select>
                    </div>
                  </div>

                  {/* Language Select */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-mystic-700">
                      Report Language
                    </label>
                    <div className="relative">
                      <select
                        className="select-input w-full px-3 py-1.5 text-sm sm:px-4 sm:py-2.5 sm:text-base rounded-lg border-mystic-300 focus:ring-2 focus:ring-mystic-400 appearance-none bg-no-repeat bg-[length:20px_20px] bg-[right_12px_center]"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3e%3cpath d='M15.3 9.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4l3.3 3.29 3.3-3.3z'/%3e%3c/svg%3e")` }}
                        value={formData.language}
                        onChange={(e) =>
                          setFormData({ ...formData, language: e.target.value })
                        }
                      >
                        <option value="">Select Language</option>
                        <option value="english">English</option>
                        <option value="hindi">Hindi</option>
                        <option value="bengali">Bengali</option>
                        <option value="marathi">Marathi</option>
                        <option value="tamil">Tamil</option>
                        <option value="telugu">Telugu</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                type="submit" 
                className="primary-button w-full py-2.5 px-4 sm:py-3.5 sm:px-6 rounded-xl bg-mystic-600 hover:bg-mystic-700 text-white font-medium transition-colors duration-200 transform hover:scale-[1.01] shadow-lg shadow-mystic-200/50 active:scale-95"
              >
                <Star className="w-5 h-5 inline-block mr-2 -mt-0.5 stroke-2" />
                Generate Full Analysis
              </button>
            </div>
          </form>

          {/* Disclaimer */}
          <div className="mt-4 text-center text-xs text-mystic-500/80">
            Disclaimer: We do not collect or store any data. Some information may be inaccurate due to technical limitations.
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
